import os
import pandas as pd
import json
from reportlab.lib.pagesizes import letter, landscape
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
    doc = SimpleDocTemplate(file_path, pagesize=landscape(letter))  # Changed to landscape for wider tables
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
                    # Format complex values
                    if isinstance(sub_value, dict):
                        formatted_value = format_dict_for_display(sub_value)
                    else:
                        formatted_value = str(sub_value)
                    
                    data.append([sub_key, formatted_value])
                
                table = Table(data, colWidths=[200, 400])  # Wider value column for complex data
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),  # Left align items
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),  # Left align values for readability
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
                    # Format complex values
                    if isinstance(sub_value, dict):
                        formatted_value = format_dict_for_display(sub_value)
                    else:
                        formatted_value = str(sub_value)
                    
                    data.append([sub_key, formatted_value])
                
                table = Table(data, colWidths=[200, 400])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
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
            
            # Special handling for genre_preferences_by_age
            if key == 'genre_preferences_by_age':
                # Create a more structured table for age preferences
                if isinstance(value, dict):
                    # Get all age groups
                    age_groups = set()
                    genres = list(value.keys())
                    
                    # Find all age groups across all genres
                    for genre_data in value.values():
                        if isinstance(genre_data, dict):
                            for age_group in genre_data.keys():
                                age_groups.add(age_group)
                    
                    age_groups = sorted(list(age_groups))
                    
                    # Create header row with age groups
                    header_row = ["Genre"] + age_groups
                    data = [header_row]
                    
                    # Add data for each genre
                    for genre, age_data in value.items():
                        if isinstance(age_data, dict):
                            row = [genre]
                            for age_group in age_groups:
                                preference = age_data.get(age_group, "N/A")
                                row.append(str(preference))
                            data.append(row)
                    
                    # Calculate column widths based on number of columns
                    col_count = len(header_row)
                    available_width = 600  # Total available width
                    genre_col_width = 120  # Fixed width for genre column
                    age_col_width = (available_width - genre_col_width) / (col_count - 1)
                    col_widths = [genre_col_width] + [age_col_width] * (col_count - 1)
                    
                    table = Table(data, colWidths=col_widths)
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    elements.append(table)
                    elements.append(Spacer(1, 12))
            else:
                # Standard table processing for other user segments data
                if isinstance(value, dict):
                    data = [["Item", "Value"]]
                    for sub_key, sub_value in value.items():
                        # Format complex values
                        if isinstance(sub_value, dict):
                            formatted_value = format_dict_for_display(sub_value)
                        else:
                            formatted_value = str(sub_value)
                        
                        data.append([sub_key, formatted_value])
                    
                    table = Table(data, colWidths=[200, 400])
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    elements.append(table)
                    elements.append(Spacer(1, 12))
    
    # Build the PDF
    doc.build(elements)

def format_dict_for_display(d):
    """Format a dictionary for better display in tables"""
    formatted_parts = []
    for k, v in d.items():
        formatted_parts.append(f"{k}: {v}")
    return ", ".join(formatted_parts)

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
            'Metric': ['Report Name', 'Report Date', 'Total Users'],
            'Value': [
                report_data.get('report_name', 'Unnamed'),
                report_data.get('report_date', ''), 
                report_data.get('total_users', 0)
            ]
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
                            'Value': sub_value if not isinstance(sub_value, dict) else json.dumps(sub_value)
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
                            'Value': sub_value if not isinstance(sub_value, dict) else json.dumps(sub_value)
                        })
            if content_data:
                pd.DataFrame(content_data).to_excel(writer, sheet_name='Content Performance', index=False)
        
        # User Segments sheet
        if 'user_segments' in report_data:
            # General user segments data
            segments_data = []
            
            # Handle regular data and separate genre_preferences_by_age
            for key, value in report_data['user_segments'].items():
                if key == 'genre_preferences_by_age' and isinstance(value, dict):
                    # Create special sheet for genre preferences by age
                    # First prepare the data as a proper DataFrame
                    genres = []
                    age_data = {}
                    
                    for genre, prefs in value.items():
                        genres.append(genre)
                        if isinstance(prefs, dict):
                            for age_group, score in prefs.items():
                                if age_group not in age_data:
                                    age_data[age_group] = {}
                                age_data[age_group][genre] = score
                    
                    # Create a DataFrame for each age group
                    if age_data:
                        age_df = pd.DataFrame(age_data).T
                        age_df.index.name = 'Age Group'
                        age_df.to_excel(writer, sheet_name='Genre Prefs by Age')
                else:
                    # Regular data handling
                    if isinstance(value, dict):
                        for sub_key, sub_value in value.items():
                            segments_data.append({
                                'Category': key,
                                'Item': sub_key,
                                'Value': sub_value if not isinstance(sub_value, dict) else json.dumps(sub_value)
                            })
            
            if segments_data:
                pd.DataFrame(segments_data).to_excel(writer, sheet_name='User Segments', index=False)