from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.docstore.document import Document

base_prompt = """A profound and powerful writer, you have been given a context text and a search query, {0}. You must write an in-depth analysis, highlighting the significance of {0} in larger context's meaning as well as INCLUDE AS MANY SPECIFIC QUOTATIONS AS POSSIBLE (marked with quotes) from the context and note what page you found them from. Try to prioritize quotations in responses that should be about 1000 characters total. 
""" 

def summarize_context(search_term: str, contexts: list[str], openai_api_key: str):
    try:
        if openai_api_key:
            llm = OpenAI(temperature=0, openai_api_key=openai_api_key)
        else: 
            llm = OpenAI(temperature=0)
        docs = [Document(page_content=context) for context in contexts]
        # have to do a little weird acrobatics here because summarize cannot take more than one input
        # so have to construct the prompt template string after we interpolate the characters
        final_prompt = base_prompt.format(search_term) + "\n{text}\n\nSUMMARY:"
        final_prompt_template = PromptTemplate(template = final_prompt, input_variables=["text"])
        llm_summarize = load_summarize_chain(llm, chain_type="map_reduce", return_intermediate_steps=True, map_prompt=final_prompt_template, combine_prompt=final_prompt_template)
        global_summary = llm_summarize({"input_documents": docs}, return_only_outputs=True)
        if (len(global_summary["output_text"]) > 400):
            return global_summary["output_text"]
        else:
            # To augment the summary with more details that don't get lost, we extract some info from the summaries
            doc_summaries = [Document(page_content=summary) for summary in global_summary["intermediate_steps"]]
            qa_chain = load_qa_chain(llm, chain_type="stuff")
            query = "What is the significance of {0} in the context and quotes (include quotations) to back up your reasoning".format(search_term)
            additional_context = qa_chain({"input_documents": doc_summaries, "question": query}, return_only_outputs=True)
            return global_summary["output_text"] + additional_context["output_text"]
    except Exception as e:
        print("Error generating summary: ", e)
        raise e
