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

    data = [
        {  # warren
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 2.91, -3.52, 5.89, 27.31, 23.45]
        },
        {  # Li Lu REAL
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 2.75, -3.75, 6.24, 26.94, 23.73]
        },
        {  # bill ackman REAL
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 2.42, -2.89, 0.29, 5.83, 5.52]
        },
        {  # risky norris
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, -3.82, -1.25, 0.57, 1.37, 0.65]
        },
        {  # bryan lawrence
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, -4.13, -0.88, 0.43, 1.68, 0.53]
        },
        {  # norbert lou REAL
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 4.10, 7.78, 3.74, 4.23, 3.44]
        },
        {  # ro kanna
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 2.98, -4.17, 6.39, 26.27, 24.07]
        },
        {  # nancy
            "x": ["2025-01-01", "2025-03-11", "2025-05-20", "2025-07-29", "2025-10-07", "2025-11-21"],
            "y": [0.0, 2.98, -4.17, 6.39, 26.27, 24.07]
        }
    ]

    # Build an interactive line chart
    chart = (
        alt.Chart(pl.DataFrame(data[request.tracker_id-1]))
        .mark_area(
            line={'color': '#4c78a8'},  # colour of the line itself
            color=alt.Gradient(
                gradient='linear',
                stops=[alt.GradientStop(color='#4c78a8', offset=0),
                       alt.GradientStop(color='#4c78a800', offset=1)],  # add transparency at the bottom
                x1=0, x2=0, y1=0, y2=1   # vertical gradient
            )
        )
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
