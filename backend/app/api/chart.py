import altair as alt
import yfinance as yf
import polars as pl
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


class ChartRequest(BaseModel):
    val: int
    tracker_id: int


router = APIRouter(prefix="/chart")


@router.post("/test")
def test(request: ChartRequest):

    data = [{
        "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
        "y": [0.0, 2.75, -3.75, 6.24, 26.94, 23.73]
    }]

    # Build an interactive line chart
    chart = (
        alt.Chart(pl.DataFrame(data[request.tracker_id-1]))
        .mark_line()
        .encode(
            x=alt.X("x:T").axis(title=None, labelFontSize=14),
            y=alt.Y("y:Q").axis(title="Retorno acumulado", labelFontSize=14, titleFontSize=16)
        )
        .configure_axis(
            labelFontSize=14,
            titleFontSize=16
        )
        .properties(width=500)
    )

    chart_spec = chart.to_dict()

    return {
        "status": "success",
        "spec": chart_spec
    }
