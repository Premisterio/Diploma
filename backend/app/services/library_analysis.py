import json
import os
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import re

from app.models.library_data import AnalysisReport, DataFile
from app.models.analyst import Analyst

class LibraryDataAnalyzer:
    def __init__(self, data_path):
        """Initialize with path to data.json file"""
        self.load_data(data_path)
        self.initialize_dataframes()

    def load_data(self, data_path):
        """Load JSON data from file"""
        with open(data_path, 'r') as file:
            self.raw_data = json.load(file)
        self.users = self.raw_data['users']

    def initialize_dataframes(self):
        """Convert nested JSON to pandas DataFrames for easier analysis"""
        # Core user data
        user_base_data = []
        for user in self.users:
            base_data = {
                'user_id': user['user_id'],
                'registration_date': user['account']['registration_date'],
                'account_type': user['account']['account_type'],
                'subscription_status': user['account']['subscription_status'],
                'login_frequency': user['account']['login_frequency'],
                'last_login': user['account']['last_login'],
                'age_range': user['profile']['age_range'],
                'education_level': user['profile']['education_level'],
                'profession': user['profile']['profession']
            }
            user_base_data.append(base_data)
        self.user_df = pd.DataFrame(user_base_data)

        # Book borrowing data
        borrowing_data = []
        for user in self.users:
            user_id = user['user_id']
            for book in user['activity'].get('books_borrowed', []):
                book_data = {
                    'user_id': user_id,
                    'book_id': book['book_id'],
                    'title': book['title'],
                    'author': book['author'],
                    'genre': book['genre'],
                    'borrowed_date': book['borrowed_date'],
                    'return_date': book.get('return_date'),
                    'rating': book.get('rating'),
                    'completed': book.get('completed', False)
                }
                borrowing_data.append(book_data)
        self.borrowing_df = pd.DataFrame(borrowing_data)

        # Reading sessions data
        session_data = []
        for user in self.users:
            user_id = user['user_id']
            for session in user['activity'].get('reading_sessions', []):
                session_info = {
                    'user_id': user_id,
                    'book_id': session['book_id'],
                    'date': session['date'],
                    'duration_minutes': session['duration_minutes'],
                    'pages_read': session['pages_read'],
                    'device': session['device']
                }
                session_data.append(session_info)
        self.session_df = pd.DataFrame(session_data)

        # Search history data
        search_data = []
        for user in self.users:
            user_id = user['user_id']
            for search in user['activity'].get('search_history', []):
                search_info = {
                    'user_id': user_id,
                    'timestamp': search['timestamp'],
                    'query': search['query']
                }
                search_data.append(search_info)
        self.search_df = pd.DataFrame(search_data)

        # Process datetime columns in all dataframes
        self.process_datetime_columns()

    def process_datetime_columns(self):
        """Convert string datetime to datetime objects"""
        # Process user dataframe
        datetime_cols = ['registration_date', 'last_login']
        for col in datetime_cols:
            if col in self.user_df.columns:
                # Parse with timezone information, then convert to naive datetime
                self.user_df[col] = pd.to_datetime(self.user_df[col]).dt.tz_localize(None)

        # Process borrowing dataframe
        if not self.borrowing_df.empty:
            for col in ['borrowed_date', 'return_date']:
                if col in self.borrowing_df.columns:
                    self.borrowing_df[col] = pd.to_datetime(self.borrowing_df[col]).dt.tz_localize(None)

        # Process session dataframe
        if not self.session_df.empty:
            if 'date' in self.session_df.columns:
                self.session_df['date'] = pd.to_datetime(self.session_df['date']).dt.tz_localize(None)

        # Process search dataframe
        if not self.search_df.empty:
            if 'timestamp' in self.search_df.columns:
                self.search_df['timestamp'] = pd.to_datetime(self.search_df['timestamp']).dt.tz_localize(None)

    # Analysis methods (same as in your original app.py)
    def analyze_usage_patterns(self):
        """Analyze user activity patterns"""
        results = {}

        if not self.session_df.empty:
            # Daily activity pattern (hour of day)
            self.session_df['hour'] = self.session_df['date'].dt.hour
            hourly_activity = self.session_df['hour'].value_counts().sort_index()
            results['hourly_activity'] = hourly_activity.to_dict()

            # Weekly pattern
            self.session_df['day_of_week'] = self.session_df['date'].dt.day_name()
            day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            weekly_activity = self.session_df['day_of_week'].value_counts()
            weekly_activity = weekly_activity.reindex(day_order)
            results['weekly_activity'] = weekly_activity.to_dict()

            # Average session duration by device
            avg_duration = self.session_df.groupby('device')['duration_minutes'].mean()
            results['avg_duration_by_device'] = avg_duration.to_dict()

            # Average pages read per session
            avg_pages = self.session_df.groupby('device')['pages_read'].mean()
            results['avg_pages_by_device'] = avg_pages.to_dict()

        # User activity recency
        self.user_df['last_login_naive'] = self.user_df['last_login'].dt.tz_localize(None)
        self.user_df['days_since_login'] = (datetime.now() - self.user_df['last_login_naive']).dt.days

        recency_segments = pd.cut(self.user_df['days_since_login'],
                                  bins=[0, 7, 30, 90, float('inf')],
                                  labels=['Last 7 days', '8-30 days', '31-90 days', '90+ days'])
        recency_counts = recency_segments.value_counts()
        results['login_recency'] = recency_counts.to_dict()

        return results

    def analyze_content_performance(self):
        """Analyze book performance metrics"""
        results = {}

        if not self.borrowing_df.empty:
            # Most borrowed books
            top_books = self.borrowing_df['title'].value_counts().head(10)
            results['top_borrowed_books'] = top_books.to_dict()

            # Genre popularity
            genre_popularity = self.borrowing_df['genre'].value_counts()
            results['genre_popularity'] = genre_popularity.to_dict()

            # Average ratings by genre
            avg_ratings = self.borrowing_df.groupby('genre')['rating'].mean().round(2)
            results['avg_ratings_by_genre'] = avg_ratings.to_dict()

            # Completion rates by genre
            completion_rates = self.borrowing_df.groupby('genre')['completed'].mean().round(2)
            results['completion_rates'] = completion_rates.to_dict()

            # Top authors
            top_authors = self.borrowing_df['author'].value_counts().head(10)
            results['top_authors'] = top_authors.to_dict()

        return results

    def analyze_user_segments(self):
        """Segment users based on behavior and demographics"""
        results = {}

        # Segment by account type
        account_distribution = self.user_df['account_type'].value_counts()
        results['account_type_distribution'] = account_distribution.to_dict()

        # Segment by age range
        age_distribution = self.user_df['age_range'].value_counts()
        results['age_distribution'] = age_distribution.to_dict()

        # Segment by education
        education_distribution = self.user_df['education_level'].value_counts()
        results['education_distribution'] = education_distribution.to_dict()

        # Segment by profession
        profession_distribution = self.user_df['profession'].value_counts().head(10)
        results['top_professions'] = profession_distribution.to_dict()

        # Cross-analyze age and content preferences
        if not self.borrowing_df.empty:
            # Merge user and borrowing data
            user_borrow = pd.merge(self.borrowing_df, self.user_df[['user_id', 'age_range']], on='user_id')
            genre_by_age = user_borrow.groupby(['age_range', 'genre']).size().unstack().fillna(0)

            # Convert to percentages within each age group
            genre_by_age_pct = genre_by_age.div(genre_by_age.sum(axis=1), axis=0).round(2)
            results['genre_preferences_by_age'] = genre_by_age_pct.to_dict()

        return results

    def analyze_search_patterns(self):
        """Analyze user search behavior"""
        results = {}

        if not self.search_df.empty:
            # Extract common keywords from searches
            all_queries = ' '.join(self.search_df['query'].tolist()).lower()
            # Remove stopwords (simplified approach)
            stopwords = ['the', 'a', 'an', 'and', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'by']
            query_words = [word for word in re.findall(r'\b\w+\b', all_queries) if word not in stopwords]

            word_freq = Counter(query_words).most_common(20)
            results['top_search_terms'] = dict(word_freq)

            # Search volume by hour of day
            self.search_df['hour'] = self.search_df['timestamp'].dt.hour
            search_by_hour = self.search_df['hour'].value_counts().sort_index()
            results['searches_by_hour'] = search_by_hour.to_dict()

        return results

    def analyze_retention(self):
        """Analyze user retention metrics"""
        results = {}

        # Calculate account age
        self.user_df['registration_date_naive'] = self.user_df['registration_date'].dt.tz_localize(None)
        self.user_df['account_age_days'] = (datetime.now() - self.user_df['registration_date_naive']).dt.days

        # Segment by account age
        age_bins = [0, 30, 90, 180, 365, float('inf')]
        age_labels = ['< 1 month', '1-3 months', '3-6 months', '6-12 months', '> 1 year']
        self.user_df['account_age_segment'] = pd.cut(self.user_df['account_age_days'],
                                                     bins=age_bins,
                                                     labels=age_labels)

        tenure_dist = self.user_df['account_age_segment'].value_counts()
        results['user_tenure_distribution'] = tenure_dist.to_dict()

        # Activity by tenure
        if not self.session_df.empty:
            user_activity = self.session_df.groupby('user_id').size().reset_index(name='activity_count')
            user_tenure = pd.merge(user_activity,
                                   self.user_df[['user_id', 'account_age_segment']],
                                   on='user_id')
            activity_by_tenure = user_tenure.groupby('account_age_segment', observed=False)[
                'activity_count'].mean().round(1)
            results['avg_activity_by_tenure'] = activity_by_tenure.to_dict()

        return results

    def generate_comprehensive_report(self):
        """Generate a comprehensive analysis report"""
        report = {
            'report_date': datetime.now().strftime('%Y-%m-%d'),
            'total_users': len(self.user_df),
            'usage_patterns': self.analyze_usage_patterns(),
            'content_performance': self.analyze_content_performance(),
            'user_segments': self.analyze_user_segments(),
            'search_patterns': self.analyze_search_patterns(),
            'retention_metrics': self.analyze_retention()
        }

        return report

def create_data_file(db: Session, file_path: str, analyst_id: int, filename: str):
    """Store information about an uploaded data file"""
    data_file = DataFile(
        analyst_id=analyst_id,
        filename=filename,
        file_path=file_path
    )
    db.add(data_file)
    db.commit()
    db.refresh(data_file)
    return data_file

def get_data_files_by_analyst(db: Session, analyst_id: int):
    """Get all data files uploaded by an analyst"""
    return db.query(DataFile).filter(DataFile.analyst_id == analyst_id).all()

def save_analysis_report(db: Session, report_name: str, report_data: Dict, analyst_id: int):
    """Save analysis report to database"""
    report = AnalysisReport(
        analyst_id=analyst_id,
        report_name=report_name,
        report_data=report_data
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_reports_by_analyst(db: Session, analyst_id: int):
    """Get all reports created by an analyst"""
    return db.query(AnalysisReport).filter(AnalysisReport.analyst_id == analyst_id).all()

def get_report_by_id(db: Session, report_id: int):
    """Get a specific report by ID"""
    return db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()