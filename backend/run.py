"""Точка входа: 0.0.0.0:13444 по просьбе пользователя."""

from __future__ import annotations

import argparse

from app import create_app


def main() -> None:
    parser = argparse.ArgumentParser(description="learn-git server")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=13444)
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    app = create_app()
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()
