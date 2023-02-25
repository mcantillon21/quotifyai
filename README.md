
# Quotify 💭
Generate meaningful quotes from books, articles, or literally anything that can be turned into a PDF. 

Website [here](https://quotifyai.com/). Built by [Molly](https://twitter.com/mollycantillon). 

### Background

Quotify is a AI-powered quote finder for any text-based PDF, extracting the most relavant quotes to substantiate your claim. What if we didn't have to scour texts for hours in search of a thesis-supporting quote?

Provided the full length of riveting multi-dimensioned novels, intensive drama telenovella scripts, dense academic journal entries, and everything in between, Quotify finds the most significant parts of the text in relation to your ideated topic. This means you can now find Shakespeare quotes, cited within the text, about free will _and_ environmental activism. 

### Technical Implementation
Quotify uses the following tools:

-  [PyPDF](https://pypdf2.readthedocs.io/en/3.0.0/) for parsing the uploaded PDF doc into text
-  [NLTK](https://www.nltk.org/) for slicing the text into relevant chunks pertaining to the query
-  [OpenAI's Embedding Model](https://platform.openai.com/docs/guides/embeddings) for embeddings of words
-  [Facebook Research's FAISS library](https://github.com/facebookresearch/faiss) for extracting the most relevant chunks in the text as well as surrounding context
-  [Langchain](https://github.com/hwchase17/langchain) for summarization and extraction
-  [GPT's Davinci model](https://platform.openai.com/docs/models/overview) for analysis 
-  [FastAPI](https://fastapi.tiangolo.com/) for backend
-  [Modal](https://modal.com/) for serverless deployment 

### Backend
The backend uses a Makefile for our build process [Poetry](https://python-poetry.org/) as our dependency manager for Python. Install poetry, change directories into the `server` folder, and then run `poetry install` to install all dependencies. Note that we require `python 3.9.13` and that the [Rust Compiler](https://www.rust-lang.org/) must be installed on your machine in order to build certain dependencies.

Afterwards, run `make setup` to configure your environment to run our application. To run the server run `make server`. 

### Frontend
The frontend is built using [React](https://reactjs.org/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/) and [Chakra-UI](https://chakra-ui.com). To run the web app locally, change directories into `frontend` nd run `npm install` to install all dependencies. Then run `npm run dev`. 

## Acknowledgements & Disclaimer

I learned a lot from [Amir](https://twitter.com/amirbolous) & [Verumlotus's](https://twitter.com/verumlotus) [SweetSerenade](https://www.sweetserenade.xyz/) while building this.

Please note that this tool is intended as an experimental exploration of quote extraction using advanced AI technology, and should not be relied upon as a replacement for thorough research or analysis in any academic or professional context. While we have taken every effort to ensure accuracy and proper citation of sources, we cannot provide a full guarantee of the correctness of our analyses.

