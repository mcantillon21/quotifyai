#!/bin/bash
# This is used for coloring output of this script

echo "Running Setup Script"

# Notify the user if an OpenAI key is not detected
if [[ -z "${OPENAI_API_KEY}" ]]; then
  echo -e "${RED}OPENAI_API_KEY was not detected in environment variable. Please ensure it's located in .env${NC}"
fi

# Install the punkt file for nltk 
python3 <<HEREDOC
import nltk
nltk.download('punkt')
print('here')
HEREDOC

echo -e "${GREEN}Shell Script Done${NC}"
exit 0