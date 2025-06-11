from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import Agent, Runner, RunConfig, AsyncOpenAI, OpenAIChatCompletionsModel
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# Setup
gemini_api_key = os.getenv("GEMINI_API_KEY")

provider = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=provider
)
run_config = RunConfig(
    model=model,
    model_provider=provider,
    tracing_disabled=True
)

agent = Agent(
    name="Mental Health Assistant",
    instructions="""You are a mental health assistant. Your role is to provide empathetic and supportive responses to users seeking help with mental health issues. Always prioritize the user's well-being and provide appropriate resources when necessary. Answer the user's questions in concise way means don't answer them too long.
    If user say something in urdu so answer them in urdu.
    If user say something in english so answer them in english.
    If you are not sure about the answer, say 'I am not sure about that.
    If you don't know the answer, say 'I don't know the answer to that.'""",
)

# FastAPI App
app = FastAPI()

# Allow CORS from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schema
class ChatRequest(BaseModel):
    history: list
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    input_data = req.history + [{"role": "user", "content": req.message}]
    result = await Runner.run(agent, input=input_data, run_config=run_config)
    return {"reply": result.final_output}

