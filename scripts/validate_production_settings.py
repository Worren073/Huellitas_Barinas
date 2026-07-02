#!/usr/bin/env python
"""
Production Settings Validator
Validates that all required environment variables are set correctly
before deploying to production.

Usage:
    python scripts/validate_production_settings.py
    python scripts/validate_production_settings.py --check-secrets
"""

import os
import sys
import re
import argparse
from pathlib import Path
from urllib.parse import urlparse


class SettingsValidator:
    """Validates production settings and environment variables."""
    
    # ANSI color codes
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success = []
        self.env = os.environ.copy()
    
    def log_error(self, msg: str):
        """Log error message."""
        self.errors.append(msg)
        print(f"{self.RED}❌ ERROR: {msg}{self.RESET}")
    
    def log_warning(self, msg: str):
        """Log warning message."""
        self.warnings.append(msg)
        print(f"{self.YELLOW}⚠️  WARNING: {msg}{self.RESET}")
    
    def log_success(self, msg: str):
        """Log success message."""
        self.success.append(msg)
        print(f"{self.GREEN}✅ {msg}{self.RESET}")
    
    def log_info(self, msg: str):
        """Log info message."""
        print(f"{self.BLUE}ℹ️  {msg}{self.RESET}")
    
    # ========================================================================
    # VALIDATION METHODS
    # ========================================================================
    
    def validate_django_settings(self):
        """Validate core Django settings."""
        print(f"\n{self.BOLD}[1/8] Django Core Settings{self.RESET}")
        
        # Check DEBUG is False
        debug = self.env.get('DEBUG', '').lower() in ('true', '1', 'yes')
        if debug:
            self.log_error("DEBUG must be False in production")
        else:
            self.log_success("DEBUG is False")
        
        # Check SECRET_KEY
        secret_key = self.env.get('SECRET_KEY', '').strip()
        if not secret_key:
            self.log_error("SECRET_KEY is not set")
        elif len(secret_key) < 50:
            self.log_error(f"SECRET_KEY is too short ({len(secret_key)} chars, need 50+)")
        elif secret_key.startswith('django-insecure-'):
            self.log_warning("SECRET_KEY starts with 'django-insecure-' (default development key)")
        else:
            self.log_success(f"SECRET_KEY is set ({len(secret_key)} chars)")
        
        # Check ALLOWED_HOSTS
        allowed_hosts = self.env.get('ALLOWED_HOSTS', '').strip()
        if not allowed_hosts:
            self.log_error("ALLOWED_HOSTS is not set")
        elif 'localhost' in allowed_hosts or '127.0.0.1' in allowed_hosts:
            self.log_warning("ALLOWED_HOSTS contains localhost/127.0.0.1 (ok for staging, not production)")
        else:
            hosts = [h.strip() for h in allowed_hosts.split(',')]
            self.log_success(f"ALLOWED_HOSTS set: {', '.join(hosts)}")
    
    def validate_database(self):
        """Validate database configuration."""
        print(f"\n{self.BOLD}[2/8] Database Configuration{self.RESET}")
        
        db_url = self.env.get('DATABASE_URL', '').strip()
        
        if db_url:
            # Validate DATABASE_URL format
            if not db_url.startswith('postgresql://'):
                self.log_error(f"DATABASE_URL must start with 'postgresql://' (got: {db_url[:30]}...)")
            else:
                self.log_success("DATABASE_URL format is valid")
                
                # Check for SSL mode
                if 'sslmode' not in db_url:
                    self.log_warning("DATABASE_URL should include ?sslmode=require for security")
        else:
            # Validate individual DB variables
            db_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']
            missing = [v for v in db_vars if not self.env.get(v, '').strip()]
            
            if missing:
                self.log_error(f"Missing database variables: {', '.join(missing)}")
            else:
                self.log_success("All database variables are set")
            
            # Test DB Host accessibility
            db_host = self.env.get('DB_HOST', 'localhost')
            if db_host in ('localhost', '127.0.0.1', 'db'):
                self.log_warning(f"DATABASE_HOST is '{db_host}' (check if accessible from production)")
    
    def validate_redis(self):
        """Validate Redis configuration."""
        print(f"\n{self.BOLD}[3/8] Redis & Celery Configuration{self.RESET}")
        
        redis_url = self.env.get('REDIS_URL', '').strip()
        
        if not redis_url:
            self.log_error("REDIS_URL is not set (required for Celery and cache)")
        elif not redis_url.startswith('redis://'):
            self.log_error(f"REDIS_URL must start with 'redis://' (got: {redis_url[:30]}...)")
        else:
            try:
                parsed = urlparse(redis_url)
                host = parsed.hostname or 'localhost'
                port = parsed.port or 6379
                
                if host in ('localhost', '127.0.0.1'):
                    self.log_warning(f"REDIS_URL points to {host} (check if accessible from production)")
                else:
                    self.log_success(f"REDIS_URL configured: {host}:{port}")
            except Exception as e:
                self.log_error(f"REDIS_URL parse error: {e}")
    
    def validate_cors(self):
        """Validate CORS configuration."""
        print(f"\n{self.BOLD}[4/8] CORS Configuration{self.RESET}")
        
        cors_origins = self.env.get('CORS_ALLOWED_ORIGINS', '').strip()
        
        if not cors_origins:
            self.log_error("CORS_ALLOWED_ORIGINS is not set")
        else:
            origins = [o.strip() for o in cors_origins.split(',')]
            
            localhost_origins = [o for o in origins if 'localhost' in o or '127.0.0.1' in o]
            if localhost_origins:
                self.log_warning(f"CORS_ALLOWED_ORIGINS contains localhost: {localhost_origins}")
            
            http_origins = [o for o in origins if o.startswith('http://')]
            if http_origins:
                self.log_warning(f"CORS_ALLOWED_ORIGINS contains insecure HTTP: {http_origins}")
            
            https_origins = [o for o in origins if o.startswith('https://')]
            if https_origins:
                self.log_success(f"CORS configured with HTTPS: {https_origins}")
            elif not localhost_origins and not http_origins:
                self.log_warning("No HTTPS origins in CORS configuration")
    
    def validate_email(self):
        """Validate email configuration."""
        print(f"\n{self.BOLD}[5/8] Email Configuration{self.RESET}")
        
        email_host_user = self.env.get('EMAIL_HOST_USER', '').strip()
        email_host_password = self.env.get('EMAIL_HOST_PASSWORD', '').strip()
        
        if not email_host_user or not email_host_password:
            self.log_warning("Email credentials not set (email functionality will be disabled)")
        else:
            # Validate email format
            if '@' not in email_host_user:
                self.log_warning(f"EMAIL_HOST_USER doesn't look like email: {email_host_user}")
            else:
                self.log_success(f"Email configured: {email_host_user}")
    
    def validate_storage(self):
        """Validate cloud storage configuration."""
        print(f"\n{self.BOLD}[6/8] Cloud Storage (Cloudflare R2){self.RESET}")
        
        aws_key = self.env.get('AWS_ACCESS_KEY_ID', '').strip()
        aws_secret = self.env.get('AWS_SECRET_ACCESS_KEY', '').strip()
        aws_endpoint = self.env.get('AWS_S3_ENDPOINT_URL', '').strip()
        aws_bucket = self.env.get('AWS_STORAGE_BUCKET_NAME', '').strip()
        
        if not (aws_key and aws_secret and aws_endpoint and aws_bucket):
            self.log_warning("R2 storage not fully configured (local storage will be used)")
        else:
            if not aws_endpoint.startswith('https://'):
                self.log_error("AWS_S3_ENDPOINT_URL must use HTTPS")
            else:
                self.log_success(f"R2 Storage configured: {aws_bucket}")
    
    def validate_frontend(self):
        """Validate frontend configuration."""
        print(f"\n{self.BOLD}[7/8] Frontend Configuration{self.RESET}")
        
        api_url = self.env.get('NEXT_PUBLIC_API_URL', '').strip()
        
        if not api_url:
            self.log_error("NEXT_PUBLIC_API_URL is not set")
        elif api_url.startswith('http://localhost'):
            self.log_warning("NEXT_PUBLIC_API_URL points to localhost (won't work from other machines)")
        elif not api_url.startswith('https://'):
            self.log_warning("NEXT_PUBLIC_API_URL should use HTTPS in production")
        else:
            self.log_success(f"Frontend API URL: {api_url}")
    
    def validate_security_headers(self):
        """Validate security-related settings."""
        print(f"\n{self.BOLD}[8/8] Security Headers{self.RESET}")
        
        # Check for environment-specific settings
        environment = self.env.get('ENVIRONMENT', '').lower()
        if environment not in ('production', 'staging', 'development'):
            self.log_warning(f"ENVIRONMENT '{environment}' is not standard (use: production, staging, development)")
        else:
            self.log_success(f"Environment: {environment}")
        
        # Check SENTRY_DSN for production monitoring
        sentry_dsn = self.env.get('SENTRY_DSN', '').strip()
        if not sentry_dsn and environment == 'production':
            self.log_warning("SENTRY_DSN not set (no error tracking in production)")
        elif sentry_dsn:
            self.log_success("Sentry error tracking enabled")
    
    def check_for_secrets(self):
        """Check if any secrets are accidentally exposed in source code."""
        print(f"\n{self.BOLD}[BONUS] Checking for Exposed Secrets{self.RESET}")
        
        settings_file = Path(__file__).parent.parent / 'backend' / 'config' / 'settings' / 'production.py'
        
        if not settings_file.exists():
            self.log_info(f"Settings file not found at {settings_file}")
            return
        
        suspicious_patterns = [
            (r'["\']password["\']:\s*["\'][^"\']{3,}["\']', 'Hardcoded password'),
            (r'DB_PASSWORD\s*=\s*["\'][^"\']{3,}["\']', 'Hardcoded DB password'),
            (r'SECRET_KEY\s*=\s*["\'][^"\']{30,}["\']', 'Hardcoded SECRET_KEY'),
            (r'npg_[a-zA-Z0-9_]{20,}', 'Neon API key'),
            (r'AWS_[A-Z_]+\s*=\s*["\'][a-zA-Z0-9]{20,}["\']', 'AWS/R2 credentials'),
        ]
        
        content = settings_file.read_text()
        found_secrets = False
        
        for pattern, description in suspicious_patterns:
            matches = re.findall(pattern, content)
            if matches:
                self.log_error(f"Found {description} in production.py: {matches[0][:50]}...")
                found_secrets = True
        
        if not found_secrets:
            self.log_success("No hardcoded secrets found in production.py")
    
    # ========================================================================
    # REPORT
    # ========================================================================
    
    def print_report(self):
        """Print validation report."""
        total = len(self.errors) + len(self.warnings) + len(self.success)
        
        print(f"\n{self.BOLD}{'='*70}{self.RESET}")
        print(f"{self.BOLD}VALIDATION REPORT{self.RESET}")
        print(f"{self.BOLD}{'='*70}{self.RESET}\n")
        
        print(f"{self.GREEN}✅ Success: {len(self.success)}{self.RESET}")
        print(f"{self.YELLOW}⚠️  Warnings: {len(self.warnings)}{self.RESET}")
        print(f"{self.RED}❌ Errors: {len(self.errors)}{self.RESET}\n")
        
        if self.errors:
            print(f"{self.RED}{self.BOLD}ERRORS (Must Fix Before Production):{self.RESET}")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")
        
        if self.warnings:
            print(f"\n{self.YELLOW}{self.BOLD}WARNINGS (Review Before Production):{self.RESET}")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        # Status
        print(f"\n{self.BOLD}{'='*70}{self.RESET}")
        if self.errors:
            status = f"{self.RED}❌ NOT READY FOR PRODUCTION{self.RESET}"
            exit_code = 1
        elif self.warnings:
            status = f"{self.YELLOW}⚠️  READY WITH WARNINGS{self.RESET}"
            exit_code = 0
        else:
            status = f"{self.GREEN}✅ READY FOR PRODUCTION{self.RESET}"
            exit_code = 0
        
        print(f"Status: {status}")
        print(f"{self.BOLD}{'='*70}{self.RESET}\n")
        
        return exit_code
    
    def run(self, check_secrets: bool = False):
        """Run all validations."""
        print(f"\n{self.BOLD}{self.BLUE}Huellitas Barinas - Production Settings Validator{self.RESET}\n")
        
        self.validate_django_settings()
        self.validate_database()
        self.validate_redis()
        self.validate_cors()
        self.validate_email()
        self.validate_storage()
        self.validate_frontend()
        self.validate_security_headers()
        
        if check_secrets:
            self.check_for_secrets()
        
        return self.print_report()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Validate production settings for Huellitas Barinas',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/validate_production_settings.py
  python scripts/validate_production_settings.py --check-secrets
        """
    )
    
    parser.add_argument(
        '--check-secrets',
        action='store_true',
        help='Also check for hardcoded secrets in production.py'
    )
    
    args = parser.parse_args()
    
    validator = SettingsValidator()
    exit_code = validator.run(check_secrets=args.check_secrets)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
