import altair as alt
import yfinance as yf
import vega_datasets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


class ChartRequest(BaseModel):
    val: int


router = APIRouter(prefix="/chart")


@router.post("/test")
def test(request: ChartRequest):

    # Fetch 6 months of Apple stock data
    ticker = yf.Ticker("AAPL")
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
