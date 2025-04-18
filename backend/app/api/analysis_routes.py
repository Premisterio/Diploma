from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.library_data import DataFile, AnalysisReport
from app.core.auth import get_current_analyst
from app.services.library_analysis import (
    LibraryDataAnalyzer, 
    create_data_file, 
    get_data_files_by_analyst,
    save_analysis_report,
    get_reports_by_analyst,
    get_report_by_id
)
from app.core.file_upload import save_upload_file
from app.schemas.library_data import (
    DataFileOut, 
    AnalysisReportCreate, 
    AnalysisReportOut,
    AnalysisReportDetail
)
from app.models.analyst import Analyst
from typing import List, Dict, Any
import os
import json

router = APIRouter()

@router.post("/upload-data", response_model=DataFileOut)
async def upload_data_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Upload library user data file"""
    # Validate file type
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are accepted")
    
    # Save file to disk
    file_path = save_upload_file(file, current_analyst.id)
    
    # Save file info to database
    data_file = create_data_file(db, file_path, current_analyst.id, file.filename)
    
    return data_file

@router.get("/data-files", response_model=List[DataFileOut])
async def get_data_files(
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Get all data files uploaded by the current analyst"""
    return get_data_files_by_analyst(db, current_analyst.id)

@router.post("/analyze", response_model=AnalysisReportOut)
async def analyze_data(
    report: AnalysisReportCreate,
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze a data file and save the report"""
    # Get the file
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Run analysis
        analyzer = LibraryDataAnalyzer(file.file_path)
        report_data = analyzer.generate_comprehensive_report()
        
        # Save report to database
        db_report = save_analysis_report(
            db, 
            report.report_name, 
            report_data, 
            current_analyst.id
        )
        
        return db_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/reports", response_model=List[AnalysisReportOut])
async def get_reports(
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Get all reports created by the current analyst"""
    return get_reports_by_analyst(db, current_analyst.id)

@router.get("/reports/{report_id}", response_model=AnalysisReportDetail)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Get a specific report by ID"""
    report = get_report_by_id(db, report_id)
    
    if not report or report.analyst_id != current_analyst.id:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report

@router.get("/analysis/usage-patterns")
async def get_usage_patterns(
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze usage patterns from a specific data file"""
    # Get the file
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        analyzer = LibraryDataAnalyzer(file.file_path)
        return analyzer.analyze_usage_patterns()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analysis/content-performance")
async def get_content_performance(
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze content performance from a specific data file"""
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        analyzer = LibraryDataAnalyzer(file.file_path)
        return analyzer.analyze_content_performance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analysis/user-segments")
async def get_user_segments(
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze user segments from a specific data file"""
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        analyzer = LibraryDataAnalyzer(file.file_path)
        return analyzer.analyze_user_segments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analysis/search-patterns")
async def get_search_patterns(
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze search patterns from a specific data file"""
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        analyzer = LibraryDataAnalyzer(file.file_path)
        return analyzer.analyze_search_patterns()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analysis/retention")
async def get_retention_metrics(
    file_id: int,
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Analyze retention metrics from a specific data file"""
    file = db.query(DataFile).filter(
        DataFile.id == file_id,
        DataFile.analyst_id == current_analyst.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        analyzer = LibraryDataAnalyzer(file.file_path)
        return analyzer.analyze_retention()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")