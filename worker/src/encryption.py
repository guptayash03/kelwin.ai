import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def get_key() -> bytes:
    key_b64 = os.environ.get("PORTAL_ENCRYPTION_KEY", "")
    if not key_b64:
        raise ValueError("PORTAL_ENCRYPTION_KEY not configured")
    return base64.b64decode(key_b64)


def decrypt_password(ciphertext_b64: str, iv_b64: str, auth_tag_b64: str) -> str:
    key = get_key()
    aesgcm = AESGCM(key)
    iv = base64.b64decode(iv_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    auth_tag = base64.b64decode(auth_tag_b64)
    plaintext = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
    return plaintext.decode("utf-8")
