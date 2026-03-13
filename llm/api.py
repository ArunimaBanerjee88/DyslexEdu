import torch
import torch.nn as nn
import sentencepiece as spm
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import re

# Model Architecture matching the trained weights
class TinyLLM(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super(TinyLLM, self).__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x, hidden=None):
        out = self.embed(x)
        out, hidden = self.lstm(out, hidden)
        out = self.fc(out[:, -1, :])
        return out, hidden


# Setup
vocab_size = 300
embed_dim = 128
hidden_dim = 256

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = TinyLLM(vocab_size, embed_dim, hidden_dim)
model.load_state_dict(torch.load(os.path.join(BASE_DIR, "tiny_llm.pth"), map_location="cpu"))
model.eval()

sp = spm.SentencePieceProcessor()
sp.load(os.path.join(BASE_DIR, "tokenizer.model"))

app = FastAPI()


class ChatRequest(BaseModel):
    question: str


# Text generation
def generate_text(prompt, max_len=120):
    # Match the training format exactly: User: ... \nAssistant: [space]
    format_prompt = f"User: {prompt}\nAssistant: "

    tokens = sp.encode_as_ids(format_prompt)
    if not tokens:
        tokens = [0]

    input_seq = torch.tensor([tokens], dtype=torch.long)
    hidden = None
    generated = []

    # Use greedy decoding for a tiny LSTM to ensure it follows the most likely path
    with torch.no_grad():
        for _ in range(max_len):
            out, hidden = model(input_seq, hidden)
            
            # Greedy decoding
            predicted_id = torch.argmax(out, dim=-1).item()
            
            if predicted_id == 0: # Assuming 0 might be a padding or unknown
                break

            generated.append(predicted_id)
            input_seq = torch.tensor([[predicted_id]], dtype=torch.long)

            decoded_word = sp.decode_ids([predicted_id])
            
            # Stop if the model starts repeating the prompt format or hits a newline
            if "User:" in decoded_word or "Assistant:" in decoded_word or "\n" in decoded_word:
                break
            
            # Stop on standard sentence enders if we have enough length
            if len(generated) > 5 and ("." in decoded_word or "?" in decoded_word):
                break

    ans = sp.decode_ids(generated)
    
    # Extra safety: if the model generated the question back, strip it
    ans = re.sub(r'(?i)User:|Assistant:', '', ans).strip()
    
    print(f"DEBUG: Generated text for '{prompt}' -> '{ans}'")
    return ans


# Simple dataset retrieval (RAG-lite) - kept only as a very deep fallback
def extract_fallback_answer(question):
    try:
        with open(os.path.join(BASE_DIR, "training_text.txt"), "r", encoding="utf-8") as f:
            lines = f.readlines()
            question_words = [w for w in question.lower().split() if len(w) > 3]
            for line in lines:
                if sum(word in line.lower() for word in question_words) >= 2:
                    # Return the Assistant part if it's a conversation line
                    if "Assistant:" in line:
                        return line.split("Assistant:")[1].strip()
                    return line.strip()
    except:
        pass
    return None


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    try:
        # Prompt: Use the trained model only for "good structured answers"
        # as requested, but we'll include the question in the final output.
        
        gen_ans = generate_text(req.question, max_len=100)
        
        # If the model really struggles (very short output), we can check fallback
        # but the primary response is now from the model.
        if len(gen_ans) < 5:
            fallback = extract_fallback_answer(req.question)
            if fallback:
                gen_ans = fallback
        
        # Requirement: "The chat UI should always display only the assistant’s generated answer."
        # We only return the assistant's response part.
        final_response = gen_ans
        
        return {"answer": final_response, "emotion": "happy"}

    except Exception as e:
        return {"answer": f"I'm sorry, I encountered an error: {str(e)}", "emotion": "neutral"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)