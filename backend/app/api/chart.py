import altair as alt
import yfinance as yf
import vega_datasets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


class ChartRequest(BaseModel):
    val: int
    tracker_id: int | None = None


router = APIRouter(prefix="/chart")


@router.post("/test")
def test(request: ChartRequest):

    # Use tracker_id if provided, otherwise default to AAPL
    # In the future, this will fetch data from database based on tracker_id
    ticker_symbol = "AAPL"  # Default
    if request.tracker_id:
        # TODO: Fetch ticker symbol or data from database based on tracker_id
        # For now, use different stocks as examples
        ticker_map = {
            1: "AAPL",
            2: "MSFT",
            3: "GOOGL",
            4: "AMZN",
        }
        ticker_symbol = ticker_map.get(request.tracker_id, "AAPL")
    print(request)
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period="6mo").reset_index()

    print(hist)

    # Build an interactive line chart
    chart = (
        alt.Chart(hist)
        .mark_line()
        .encode(
            x=alt.X("Date:T", title="Date"),
            y=alt.Y("Close:Q", title="Price (USD)"),
            tooltip=["Date:T", "Close:Q"],
        )
        .properties(width=1000, height=300)
        .interactive()
    )

    chart_spec = chart.to_dict()

    return {
        "status": "success",
        "spec": chart_spec
    }
