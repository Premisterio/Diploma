import os
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def export_to_pdf(report_data, file_path):
    """
    Export report data to a PDF file using ReportLab
    
    Args:
        report_data (dict): Report data dictionary
        file_path (str): Path where PDF will be saved
    """
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Add title
    title = Paragraph(f"Library Analysis Report: {report_data.get('report_name', 'Unnamed')}", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Add report date and total users
    elements.append(Paragraph(f"Report Date: {report_data.get('report_date', 'N/A')}", styles['Normal']))
    elements.append(Paragraph(f"Total Users: {report_data.get('total_users', 0)}", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Add usage patterns section
    if 'usage_patterns' in report_data:
        elements.append(Paragraph("Usage Patterns", styles['Heading2']))
        elements.append(Spacer(1, 6))
        
        for key, value in report_data['usage_patterns'].items():
            elements.append(Paragraph(key, styles['Heading3']))
            
            if isinstance(value, dict):
                data = [["Item", "Value"]]
                for sub_key, sub_value in value.items():
                    data.append([sub_key, str(sub_value)])
                
                table = Table(data, colWidths=[300, 200])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(table)
                elements.append(Spacer(1, 12))
    
    # Add content performance section
    if 'content_performance' in report_data:
        elements.append(Paragraph("Content Performance", styles['Heading2']))
        elements.append(Spacer(1, 6))
        
        for key, value in report_data['content_performance'].items():
            elements.append(Paragraph(key, styles['Heading3']))
            
            if isinstance(value, dict):
                data = [["Item", "Value"]]
                for sub_key, sub_value in value.items():
                    data.append([sub_key, str(sub_value)])
                
                table = Table(data, colWidths=[300, 200])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(table)
                elements.append(Spacer(1, 12))
    
    # Add user segments section
    if 'user_segments' in report_data:
        elements.append(Paragraph("User Segments", styles['Heading2']))
        elements.append(Spacer(1, 6))
        
        for key, value in report_data['user_segments'].items():
            elements.append(Paragraph(key, styles['Heading3']))
            
            if isinstance(value, dict):
                data = [["Item", "Value"]]
                for sub_key, sub_value in value.items():
                    data.append([sub_key, str(sub_value)])
                
                table = Table(data, colWidths=[300, 200])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(table)
                elements.append(Spacer(1, 12))
    
    # Build the PDF
    doc.build(elements)

def export_to_excel(report_data, file_path):
    """
    Export report data to an Excel file with multiple sheets
    
    Args:
        report_data (dict): Report data dictionary
        file_path (str): Path where Excel will be saved
    """
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        # Overview sheet
        overview_data = {
            'Metric': ['Report Date', 'Total Users'],
            'Value': [report_data.get('report_date', ''), report_data.get('total_users', 0)]
        }
        pd.DataFrame(overview_data).to_excel(writer, sheet_name='Overview', index=False)
        
        # Usage Patterns sheet
        if 'usage_patterns' in report_data:
            usage_data = []
            for key, value in report_data['usage_patterns'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        usage_data.append({
                            'Category': key,
                            'Item': sub_key,
                            'Value': sub_value
                        })
            if usage_data:
                pd.DataFrame(usage_data).to_excel(writer, sheet_name='Usage Patterns', index=False)
        
        # Content Performance sheet
        if 'content_performance' in report_data:
            content_data = []
            for key, value in report_data['content_performance'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        content_data.append({
                            'Category': key,
                            'Item': sub_key,
                            'Value': sub_value
                        })
            if content_data:
                pd.DataFrame(content_data).to_excel(writer, sheet_name='Content Performance', index=False)
        
        # User Segments sheet
        if 'user_segments' in report_data:
            segments_data = []
            for key, value in report_data['user_segments'].items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        segments_data.append({
                            'Category': key,
                            'Item': sub_key,
                            'Value': sub_value
                        })
            if segments_data:
                pd.DataFrame(segments_data).to_excel(writer, sheet_name='User Segments', index=False)