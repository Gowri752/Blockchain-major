from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import os
from config import Config
from routes.upload import upload_bp
from routes.verify import verify_bp
from routes.history import history_bp
from utils.cleanup import FileCleanup

# Create Flask app
app = Flask(__name__, 
            static_folder='../frontend',
            template_folder='../frontend')

# Load configuration
app.config.from_object(Config)
Config.init_app(app)

# Enable CORS
CORS(app)

# Run cleanup on startup
print(f"\n{'='*60}")
print(f"[CLEANUP] Deleting files older than {Config.RETENTION_DAYS} days...")
print(f"{'='*60}")
FileCleanup.cleanup_old_files()
print(f"{'='*60}\n")

# Register blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(verify_bp)
app.register_blueprint(history_bp)


# Routes for serving frontend
@app.route('/')
def index():
    """Serve landing page"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/upload')
def upload_page():
    """Serve upload page"""
    return send_from_directory(app.static_folder, 'upload.html')


@app.route('/verify')
def verify_page():
    """Serve verify page"""
    return send_from_directory(app.static_folder, 'verify.html')


@app.route('/history')
def history_page():
    """Serve history page"""
    return send_from_directory(app.static_folder, 'history.html')


# Static files
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)


@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)


@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve asset files"""
    return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)


# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return {'error': 'Resource not found'}, 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return {'error': 'Internal server error'}, 500


# Health check endpoint
@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'message': 'Blockchain Image Verification System is running'
    }, 200


# Serve uploaded images
@app.route('/api/image/<image_hash>')
def serve_image(image_hash):
    """Serve uploaded images by hash"""
    try:
        upload_dir = Config.UPLOAD_FOLDER
        
        # Common image extensions
        extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        
        # Try each extension
        for ext in extensions:
            filename = f"{image_hash}{ext}"
            file_path = os.path.join(upload_dir, filename)
            if os.path.exists(file_path):
                return send_from_directory(upload_dir, filename)
        
        # If not found with standard extensions, search directory
        for filename in os.listdir(upload_dir):
            if filename.startswith(image_hash):
                return send_from_directory(upload_dir, filename)
        
        # If not found, return 404
        return {'error': 'Image not found'}, 404
    except Exception as e:
        return {'error': str(e)}, 500


# Manual cleanup endpoint
@app.route('/api/cleanup', methods=['POST'])
def manual_cleanup():
    """Manually trigger cleanup of old files"""
    try:
        deleted_count = FileCleanup.cleanup_old_files()
        return {
            'success': True,
            'message': f'Cleanup completed',
            'files_deleted': deleted_count,
            'retention_days': Config.RETENTION_DAYS
        }, 200
    except Exception as e:
        return {'error': str(e)}, 500


if __name__ == '__main__':
    # Run the app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['FLASK_ENV'] == 'development'
    )
