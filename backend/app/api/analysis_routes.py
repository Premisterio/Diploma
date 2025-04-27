import os
import json
import pandas as pd
import tempfile 

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.models.library_data import DataFile, AnalysisReport, ReportExport
from app.core.database import get_db
from app.core.auth import get_current_analyst
from app.utils.export_report import export_to_pdf, export_to_excel
from app.core.file_upload import save_upload_file
from app.models.analyst import Analyst
from typing import List, Any
from fastapi.responses import FileResponse
from datetime import datetime

from app.services.library_analysis import (
    LibraryDataAnalyzer, 
    create_data_file, 
    get_data_files_by_analyst,
    save_analysis_report,
    get_reports_by_analyst,
    get_report_by_id
)

from app.schemas.library_data import (
    DataFileOut, 
    AnalysisReportCreate, 
    AnalysisReportOut,
    AnalysisReportDetail
)

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
        
@router.get("/export-report/{report_id}")
async def export_report(
    report_id: int,
    format: str = Query(..., description="Export format (pdf, csv, json, xlsx)"),
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    # Fetch the report
    report = db.query(AnalysisReport).filter(
        AnalysisReport.id == report_id,
        AnalysisReport.analyst_id == current_analyst.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Create a temporary file for the export
    temp_dir = tempfile.gettempdir()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename_base = f"library_report_{report.report_name}_{timestamp}"
    
    if format == "json":
        # Export as JSON
        file_path = os.path.join(temp_dir, f"{filename_base}.json")
        with open(file_path, 'w') as f:
            json.dump(report.report_data, f, indent=2)
        
    elif format == "csv":
        # Export as CSV
        file_path = os.path.join(temp_dir, f"{filename_base}.csv")
        
        # Convert nested report data to flattened CSV format
        data_rows = []
        
        # Process usage patterns
        if 'usage_patterns' in report.report_data:
            for key, value in report.report_data['usage_patterns'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        data_rows.append({
                            'section': 'Usage Patterns',
                            'category': key,
                            'item': sub_key,
                            'value': sub_value
                        })
        
        # Process content performance
        if 'content_performance' in report.report_data:
            for key, value in report.report_data['content_performance'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        data_rows.append({
                            'section': 'Content Performance',
                            'category': key,
                            'item': sub_key,
                            'value': sub_value
                        })
        
        # Process user segments
        if 'user_segments' in report.report_data:
            for key, value in report.report_data['user_segments'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        data_rows.append({
                            'section': 'User Segments',
                            'category': key,
                            'item': sub_key,
                            'value': sub_value
                        })
        
        # Write to CSV
        df = pd.DataFrame(data_rows)
        df.to_csv(file_path, index=False)
        
    elif format == "xlsx":
        # Export as Excel using the utility function
        file_path = os.path.join(temp_dir, f"{filename_base}.xlsx")
        export_to_excel(report.report_data, file_path)
    
    elif format == "pdf":
        # Export as PDF using the utility function
        file_path = os.path.join(temp_dir, f"{filename_base}.pdf")
        export_to_pdf(report.report_data, file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
    
    # Store the export record in the database
    export_record = ReportExport(
        report_id=report.id,
        analyst_id=current_analyst.id,
        export_format=format,
        file_path=file_path
    )
    db.add(export_record)
    db.commit()
    
    # Return the file
    media_type_mapping = {
        "pdf": "application/pdf",
        "csv": "text/csv",
        "json": "application/json",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    
    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type=media_type_mapping.get(format, f"application/{format}")
    )

@router.get("/exports")
async def get_report_exports(
    db: Session = Depends(get_db),
    current_analyst: Analyst = Depends(get_current_analyst)
):
    """Get all exported reports for the current analyst"""
    exports = db.query(ReportExport).filter(
        ReportExport.analyst_id == current_analyst.id
    ).order_by(ReportExport.created_at.desc()).all()
    
    return exports