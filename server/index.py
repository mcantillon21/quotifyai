import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from preprocessing import return_relevant_document_context
from generate import generate_quotes
from summarize import summarize_context
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import modal

NUM_CHUNKS = 10

def download_punkt():
    import nltk
    nltk.download('punkt')
    print('downloaded punkt')
    
image = modal.Image.debian_slim().pip_install(
    # langchain pkgs
    "faiss-cpu~=1.7.3",
    "langchain~=0.0.7",
    "openai~=0.26.3",
    "tenacity~=8.2.1",
    #others
    "pypdf",
    "nltk",
    "tiktoken",
    "pandas"
).run_function(download_punkt)

stub = modal.Stub(
    name="quotify",
    image=image,
    secrets=[modal.Secret.from_name("openai-secret")],
)

mount_exclude_lst = ['.venv', '.mypy_cache', '__pycache__']
filter_artifacts = lambda path: False if any([substr in path for substr in mount_exclude_lst]) else True
mount = modal.Mount.from_local_dir("../index", remote_path = "/", condition=filter_artifacts)

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompletionRequestBody(BaseModel):
    context: str

def extract_stream(file: UploadFile = File(...)):
    pdf_as_bytes = file.file.read()
    # We convert the bytes into a Streamable object of bytes
    return io.BytesIO(pdf_as_bytes)

@app.get("/")
def root():
    return {"hello": "world"}

# @app.post("/generate-quotes")
# def generate_quotes_completion():
#     try:
#         search_term = request.form['search_term']
#         body = request.json
#         completion = generate_quotes("poem", search_term, body['context'])
#         return { 'completion': completion }
#     except Exception as ex:
#         print(ex)
#         return { 'error': "Error generating completion" }

@app.post("/generate-quotes-from-pdf")
def generate_quotes_from_pdf(
    search_term: str, openai_api_key: str, file: UploadFile = File(...)
):
    try:
        stream = extract_stream(file)
        # Require OpenAI Key for documents over 50kB
        if stream.getbuffer().nbytes > 50000 and not openai_api_key:
            raise HTTPException(status_code=413, detail="Please pass in OpenAI key")
        # either parse PDF of raw text for testing
        relevant_document_context = return_relevant_document_context(
            stream, f"Retrieve the most significally relevant quotes in the text about {search_term}", NUM_CHUNKS, openai_api_key=openai_api_key
        )
        # print('PARSED REVELANT CONTEXT: ', relevant_document_context)
        print('Got relevant context')
        context_summary = summarize_context(search_term, relevant_document_context, openai_api_key=openai_api_key)
        print('SUMMARIZED CONTEXT: ' + context_summary)
        completion = generate_quotes(search_term, context_summary, openai_api_key=openai_api_key)
        print('COMPLETION   ' + completion)
        return {"summary": context_summary, "completion": completion}
    except Exception as ex:
        print(ex)
        raise ex
    finally:
        file.file.close()
        
# This hooks up our asgi fastapi app to modal
@stub.asgi(image=image, secret=modal.Secret.from_name("openai-secret"))
def fastapi_app():
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app