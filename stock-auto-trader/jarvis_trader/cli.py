from __future__ import annotations

import argparse
from pathlib import Path

from .agents import JarvisTraderTeam
from .backtest import run_backtest
from .brokers.paper import PaperBroker
from .brokers.toss_placeholder import TossSecuritiesPlaceholderAdapter
from .config import load_config
from .data_loader import group_by_symbol, load_candles
from .market_dashboard import update_dashboard
from .virtual_training import default_training_ladder, train_until_success


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="jarvis-trader",
        description="Safety-first Jarvis agent team stock trading simulator.",
    )
    parser.add_argument("--config", default="configs/trader.example.json")
    subcommands = parser.add_subparsers(dest="command", required=True)

    backtest_parser = subcommands.add_parser("backtest", help="Run a paper backtest.")
    backtest_parser.add_argument("--data", default="data/sample_candles.csv")

    train_parser = subcommands.add_parser(
        "train-virtual",
        help="Run the paper-only virtual training arena.",
    )
    train_parser.add_argument("--data", default="data/sample_candles.csv")
    train_parser.add_argument("--target-pct", type=float, default=25.0)
    train_parser.add_argument("--days", type=int, default=2)
    train_parser.add_argument("--starting-capital", type=float, default=1_000_000.0)

    run_parser = subcommands.add_parser("run-once", help="Run one agent-team decision.")
    run_parser.add_argument("--data", default="data/sample_candles.csv")
    run_parser.add_argument("--symbol", required=True)

    subcommands.add_parser("status", help="Show broker safety status.")
    dashboard_parser = subcommands.add_parser(
        "market-dashboard-update",
        help="Update the public market dashboard JSON with no synthetic prices.",
    )
    dashboard_parser.add_argument(
        "--output",
        default="data/market_dashboard/latest.json",
        help="Output JSON path.",
    )
    dashboard_parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=8,
        help="Per-request network timeout.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    config = load_config(args.config)

    if args.command == "status":
        adapter = TossSecuritiesPlaceholderAdapter(config.broker.live_trading_enabled)
        print(f"mode={config.mode_name}")
        print(f"broker={config.broker.name}")
        print(f"live_trading_enabled={config.broker.live_trading_enabled}")
        print(f"toss_adapter={adapter.name} (blocked until official API approval)")
        print(
            "daily_profit_target_pct="
            f"{config.risk.daily_profit_target_pct:.2f} (halt target, not a guarantee)"
        )
        print(
            "min_daily_profit_target_pct="
            f"{config.risk.min_daily_profit_target_pct:.2f} (planning floor, not a guarantee)"
        )
        print(f"max_daily_loss_pct={config.risk.max_daily_loss_pct:.2f}")
        print(f"rotate_kr_us={config.market_routing.rotate_kr_us}")
        print(f"allow_kr_nxt_extended={config.market_routing.allow_kr_nxt_extended}")
        print(f"allow_us_extended={config.market_routing.allow_us_extended}")
        print(
            "allow_us_overnight_when_approved="
            f"{config.market_routing.allow_us_overnight_when_approved}"
        )
        return 0

    if args.command == "market-dashboard-update":
        snapshot = update_dashboard(Path(args.output), args.timeout_seconds)
        pulse = snapshot["market_pulse"]
        print(f"output={args.output}")
        print(
            "market_pulse="
            f"available:{pulse['available_count']} "
            f"delayed:{pulse['delayed_count']} "
            f"api_required:{pulse['api_required_count']} "
            f"missing:{pulse['missing_count']} "
            f"total:{pulse['total_count']}"
        )
        return 0

    data_path = Path(args.data)
    candles = load_candles(data_path)

    if args.command == "backtest":
        summary = run_backtest(candles, config)
        print(f"symbols={','.join(summary.symbols)}")
        print(f"starting_cash={summary.starting_cash:.2f}")
        print(f"ending_equity={summary.ending_equity:.2f}")
        print(f"return_pct={summary.return_pct:.4f}")
        print(f"filled_orders={summary.filled_orders}")
        print(f"blocked_orders={summary.blocked_orders}")
        return 0

    if args.command == "train-virtual":
        result = train_until_success(
            candles,
            default_training_ladder(args.target_pct),
            required_days=args.days,
            starting_capital=args.starting_capital,
        )
        print(f"success={result.success}")
        print(f"mode={result.mode.value}")
        print(f"selected_policy={result.policy.label}")
        print(f"risk_grade={result.risk_grade.value}")
        print(f"successful_days={result.successful_days}/{args.days}")
        print(f"starting_capital={result.starting_capital:.2f}")
        print(f"ending_capital={result.ending_capital:.2f}")
        print(f"return_pct={result.return_pct:.4f}")
        for day in result.days:
            print(
                "day="
                f"{day.date.isoformat()} "
                f"success={day.success} "
                f"return_pct={day.day_return_pct:.4f} "
                f"deployed_pct={day.deployed_pct:.2f} "
                f"positions={len(day.positions)} "
                f"reason={day.reason}"
            )
        if result.risk_grade.value == "D_ORACLE_ONLY":
            print("warning=oracle teacher uses same-day high; paper training only, not a live trading signal")
        return 0

    if args.command == "run-once":
        symbol = args.symbol.upper()
        grouped = group_by_symbol(candles)
        if symbol not in grouped:
            raise SystemExit(f"symbol {symbol} not found in {data_path}")
        broker = PaperBroker(config.broker.paper_starting_cash)
        team = JarvisTraderTeam(config=config, broker=broker)
        result = team.run_once(grouped[symbol])
        for message in result.messages:
            cc = ",".join(message.cc)
            print(f"To:{message.to} CC:{cc} Subject:{message.subject}")
            print(message.body)
        if result.order:
            print(f"order_status={result.order.status.value}")
            print(f"order_message={result.order.message}")
        else:
            print("order_status=HOLD")
        return 0

    raise SystemExit(f"unknown command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
