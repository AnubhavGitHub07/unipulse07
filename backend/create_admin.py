"""
Script to create admin account directly in MongoDB
Run this if registration endpoint has issues
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import sys
import bcrypt

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def create_admin():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["unipulse"]
    
    # Admin credentials
    student_id = "admin"
    name = "Admin User"
    password = "admin123"
    role = "admin"
    
    # Check if admin already exists
    existing = await db.users.find_one({"student_id": student_id})
    if existing:
        print(f"✅ Admin account already exists!")
        print(f"   Student ID: {student_id}")
        print(f"   Role: {existing.get('role', 'student')}")
        print(f"\nYou can now login with:")
        print(f"   Student ID: {student_id}")
        print(f"   Password: {password}")
        client.close()
        return
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Create user document
    user_doc = {
        "student_id": student_id,
        "name": name,
        "email": None,
        "role": role,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user
    result = await db.users.insert_one(user_doc)
    
    print("✅ Admin account created successfully!")
    print(f"   Student ID: {student_id}")
    print(f"   Name: {name}")
    print(f"   Role: {role}")
    print(f"\nYou can now login with:")
    print(f"   Student ID: {student_id}")
    print(f"   Password: {password}")
    
    client.close()

if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

