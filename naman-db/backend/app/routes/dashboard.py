from fastapi import APIRouter
from app.services.dashboard_service import DashboardService

router = APIRouter()
dashboard_service = DashboardService()

@router.get("/")
async def get_dashboard_data():
    """
    Fetch live simulated sensor and analytics data for the dashboard.
    """
    data = dashboard_service.get_dashboard_data()
    return {
        "success": True,
        "data": data
    }
