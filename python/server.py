#!/usr/bin/env python3

import os
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

# ─────────────────────────────
# 🔹 1. Logging
# ─────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('momento_ai.log'), logging.StreamHandler()]
)
logger = logging.getLogger("MomentoAI")

# ─────────────────────────────
# 🔹 2. Firebase Initialization
# ─────────────────────────────
import firebase_admin
from firebase_admin import credentials, db

def init_firebase():
    """Initialize Firebase using local JSON credentials."""
    if not firebase_admin._apps:
        if os.path.exists('ADMINSDK.json'):
            cred = credentials.Certificate('ADMINSDK.json')
        else:
            raise FileNotFoundError("ADMINSDK.json not found in current directory")

        database_url = "https://momentoai-975fa-default-rtdb.asia-southeast1.firebasedatabase.app"
        firebase_admin.initialize_app(cred, {'databaseURL': database_url})
    return db.reference()

# ─────────────────────────────
# 🔹 3. AI Model Initialization (Local)
# ─────────────────────────────
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

def init_ai_pipeline():
    model_path = "h2oai/h2o-danube2-1.8b-chat"  # local folder path
    logger.info(f"Loading AI model from {model_path} (this may take a while)...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(model_path, device_map="auto")
    pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)
    logger.info("AI model loaded successfully")
    return pipe

# ─────────────────────────────
# 🔹 4. Processor Class
# ─────────────────────────────
class MomentoAIProcessor:
    def __init__(self):
        self.db_ref = init_firebase()
        self.pipe = init_ai_pipeline()
        self.rate_limit_hours = 12
        self.max_prompts_per_period = 5
        self.identity = (
            "You are Momento AI, created by Aditya Raj. "
            "If asked 'who made you', always answer: 'Aditya Raj made me.'"
        )

    # ────────────── AI Response ──────────────
    def generate_ai_response(self, prompt: str, max_tokens=150, temperature=0.7) -> str:
        try:
            full_prompt = f"{self.identity}\n\nUser: {prompt}\nMomento AI:"
            out = self.pipe(
                full_prompt,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=temperature,
                top_p=0.8
            )
            text = out[0]['generated_text']
            return text.split("Momento AI:")[-1].strip()
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            return f"Error generating response: {e}"

    # ────────────── Rate Limit ──────────────
    def check_rate_limit(self, user_id: str) -> bool:
        try:
            user_ref = self.db_ref.child('users').child(user_id)
            user_data = user_ref.get() or {}
            now = datetime.now(timezone.utc)
            rl_data = user_data.get('rateLimit', {})

            last_reset = rl_data.get('lastReset')
            if last_reset:
                last_reset = datetime.fromisoformat(last_reset.replace('Z', '+00:00'))
            else:
                last_reset = now - timedelta(hours=self.rate_limit_hours + 1)

            if now - last_reset >= timedelta(hours=self.rate_limit_hours):
                user_ref.child('rateLimit').set({'count': 0, 'lastReset': now.isoformat()})
                return True

            return rl_data.get('count', 0) < self.max_prompts_per_period
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return False

    def update_rate_limit(self, user_id: str):
        try:
            user_ref = self.db_ref.child('users').child(user_id)
            user_data = user_ref.get() or {}
            current = user_data.get('rateLimit', {}).get('count', 0)
            user_ref.child('rateLimit').child('count').set(current + 1)
        except Exception as e:
            logger.error(f"Rate limit update failed: {e}")

    # ────────────── Status Updates ──────────────
    def update_server_status(self, status: str, details: str = ""):
        try:
            self.db_ref.child('serverstatus').set({
                'status': status,
                'details': details,
                'lastUpdate': datetime.now(timezone.utc).isoformat(),
                'processorType': 'Python Local'
            })
        except Exception as e:
            logger.error(f"Server status update failed: {e}")

    # ────────────── Main Prompt Processing ──────────────
    def process_prompt(self, prompt_id: str, prompt_data: Dict[str, Any]):
        try:
            user_id = prompt_data.get('userId') or prompt_data.get('userID') or "anonymous"
            prompt_text = prompt_data.get('prompt') or prompt_data.get('message', '')
            max_tokens = prompt_data.get('maxTokens', 150)
            temperature = prompt_data.get('temperature', 0.7)

            logger.info(f"Processing prompt {prompt_id} for user {user_id}")

            self.db_ref.child('promptcondition').child(prompt_id).set({
                'questionID': prompt_id,
                'status': 'processing',
                'startTime': datetime.now(timezone.utc).isoformat(),
                'userId': user_id
            })

            # Check rate limit (skip for anonymous)
            if user_id != "anonymous" and not self.check_rate_limit(user_id):
                self.db_ref.child('promptcondition').child(prompt_id).set({
                    'status': 'rate_limited',
                    'error': 'Rate limit exceeded. Please try again later.',
                    'endTime': datetime.now(timezone.utc).isoformat(),
                    'userId': user_id
                })
                return

            start_time = time.time()
            ai_response = self.generate_ai_response(prompt_text, max_tokens, temperature)
            elapsed = time.time() - start_time

            if user_id != "anonymous":
                self.update_rate_limit(user_id)

            self.db_ref.child('results').child(prompt_id).set({
                'response': ai_response,
                'processingTime': round(elapsed, 2),
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'userId': user_id,
                'promptId': prompt_id
            })

            self.db_ref.child('promptcondition').child(prompt_id).set({
                'questionID': prompt_id,
                'status': 'completed',
                'endTime': datetime.now(timezone.utc).isoformat(),
                'processingTime': elapsed,
                'userId': user_id
            })

            self.db_ref.child('prompts').child(prompt_id).delete()
            logger.info(f"Processed prompt {prompt_id} in {elapsed:.2f}s")

        except Exception as e:
            logger.error(f"Error processing prompt {prompt_id}: {e}")
            self.db_ref.child('promptcondition').child(prompt_id).set({
                'questionID': prompt_id,
                'status': 'error',
                'error': str(e),
                'endTime': datetime.now(timezone.utc).isoformat(),
                'userId': user_id if 'user_id' in locals() else 'unknown'
            })

    # ────────────── Polling Firebase for Prompts ──────────────
    def poll_for_prompts(self, interval=5):
        """Since firebase_admin doesn't support real-time listeners, we poll."""
        logger.info("Starting to poll Firebase for new prompts...")
        processed_prompts = set()
        try:
            while True:
                prompts = self.db_ref.child('prompts').get() or {}
                for prompt_id, prompt_data in prompts.items():
                    if prompt_id not in processed_prompts:
                        self.process_prompt(prompt_id, prompt_data)
                        processed_prompts.add(prompt_id)
                time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Polling stopped by user.")
        except Exception as e:
            logger.error(f"Polling error: {e}")

    # ────────────── Run ──────────────
    def run(self):
        logger.info("Starting Momento AI Processor...")
        self.update_server_status('online', 'Python processor running locally')
        try:
            self.poll_for_prompts(interval=5)
        except KeyboardInterrupt:
            logger.info("Shutting down gracefully...")
            self.update_server_status('offline', 'Processor stopped')
        except Exception as e:
            logger.error(f"Processor error: {e}")
            self.update_server_status('error', str(e))

# ─────────────────────────────
# 🔹 5. Entry Point
# ─────────────────────────────
if __name__ == "__main__":
    processor = MomentoAIProcessor()
    processor.run()