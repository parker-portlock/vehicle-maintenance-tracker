"""S3 helpers — stubbed for local dev. Replace with boto3
implementations when the AWS bucket is provisioned."""

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}

def generate_presigned_upload(log_id, file_name, content_type):
    s3_key = f"attachments/{log_id}/{file_name}"
    return "not-implemented", s3_key, 0

def object_exists(s3_key: str) -> bool:
    return False

def generate_presigned_download(s3_key: str):
    return "not-implemented", 0

def delete_object(s3_key: str) -> None:
    pass