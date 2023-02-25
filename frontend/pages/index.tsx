import * as React from 'react'
import { useEffect, useState, useRef, useMemo } from 'react'
import axios from 'axios'
import Lottie from 'lottie-react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import {
  useColorMode,
  Box,
  Input,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { Typewriter } from 'react-simple-typewriter'
import { FileInput } from '../components/FileInput'
import { Gradient } from '@/utils/Gradient'
import styles from '@/styles/Home.module.css'
import animationData from '../public/animationData2.json'

const inter = Inter({ subsets: ['latin'] })

const GradientCanvas = () => {
  useEffect(() => {
    try {
      const gradient = new Gradient()
      // @ts-ignore
      gradient.initGradient('#gradient-canvas')
    } catch {}
  }, [])
  return (
    <Box pos="fixed" top={0} left={0} bottom={0} right={0} zIndex={-2}>
      <canvas id="gradient-canvas" />
    </Box>
  )
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [completion, setCompletion] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setDarkMode] = useState<boolean>(true)
  const [fileName, setFileName] = useState<string>('')
  const fileRef = useRef<FileList | null>(null)
  const [errorMessage, setErrorMesage] = useState('');

  const toast = useToast()

  const search_terms = useMemo(
    () => [
      'Innocence',
      "The significance of Piggy's Glasses",
      'Consensus',
      'Laissez-Faire Quasi-Libertarianism',
    ],
    [],
  )
  const fileNames = useMemo(
    () => [
      'To Kill a Mockingbird',
      'Lord of the Flies',
      'Bitcoin Whitepaper',
      'Atlas Shrugged',
    ],
    [],
  )

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(!checked)
    toggleColorMode()
  }

  const { colorMode, toggleColorMode } = useColorMode()

  const searchFromAPI = async (searchTerm: string) => {
    if (!searchTerm || !fileRef.current) {
      toast({
        title: 'Error: Required fields not filled out',
        description: 'Please select a file and enter a search term',
        status: 'error',
        duration: 5000,
        isClosable: true,
        containerStyle: {
          // width: "700px",
          maxWidth: '90%',
        },
      })
      return;
    }

      setLoading(true)
      setSearchTerm(searchTerm)
      setErrorMesage("")

      try {
        const formData = new FormData()

        const headers = {
          accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers'
        }
        formData.append('file', fileRef.current![0], 'file')
        const axiosResponse = await axios.post(
          // 'http://127.0.0.1:8000/generate-quotes-from-pdf',
          'https://mcantillon21--quotify-fastapi-app-dev.modal.run/generate-quotes-from-pdf',
          formData,
          {
            headers: headers,
            params: {
              search_term: searchTerm,
              openai_api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            },
          },
        )
        if (axiosResponse.status != 200) {
          setErrorMesage("Sorry, we ran into an issue. It's likely we ran out of our OpenAI credits or are being rate limited. Check back soon!")
        }
      
        setCompletion(axiosResponse.data.completion)
        setContext(axiosResponse.data.summary)
        // console.log(axiosResponse)
        setLoading(false)
      }
      catch (error) {
        console.log(error)
        setLoading(false)
        setErrorMesage("Sorry, we ran into an issue. It's likely we ran out of our OpenAI credits or are being rate limited. Check back soon!")
      }
  }

  return (
    <>
      <GradientCanvas />
      <Head>
        <title>Quotify</title>
        <meta
          name="description"
          content="Find meaningful quotes in books, articles, or anything that can be turned into PDF. "
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💭</text></svg>"
        />
      </Head>
      {/* <Box id="gradient-canvas" className="h-screen w-screen m-0" bg={gradient}> */}
      {/* <Box className="p-2">
        <DarkModeSwitch
          checked={colorMode === 'light'}
          onChange={toggleDarkMode}
          size={30}
          sunColor="white"
          moonColor="black"
        />
      </Box> */}
      <main className={styles.main}>
        <div className="align-center">
          <div className={styles.linear}>Quotify</div>
          <div className={styles.wrapper}>
            <Text className="text-center text-lg mb-2 text-white" fontSize="md">
              <i>
                Find me quotes about{' '}
                <b>
                  <span className="pink">
                    {fileRef.current ? (
                      searchTerm || 'search term'
                    ) : (
                      <Typewriter
                        typeSpeed={150}
                        deleteSpeed={50}
                        delaySpeed={4000}
                        words={search_terms}
                        loop={true}
                      ></Typewriter>
                    )}{' '}
                  </span>
                </b>
                in{' '}
                <b>
                  <span className="pink">
                    {fileRef.current ? (
                      fileName || 'fileName'
                    ) : (
                      <Typewriter
                        typeSpeed={110}
                        deleteSpeed={40}
                        delaySpeed={4900}
                        words={fileNames}
                        loop={true}
                      ></Typewriter>
                    )}{' '}
                  </span>{' '}
                </b>
              </i>
            </Text>
            <div className={styles.browserpanel}>
              <div className="flex flex-row p-2">
                <Input
                  placeholder="🔎 Search"
                  value={searchTerm}
                  id="search-bar"
                  mt={0}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  _hover={{ borderColor: '#9B72F2', borderWidth: '1px' }}
                  focusBorderColor={'#9B72F2'}
                />
                {fileName ? (
                  <div className="w-full flex flex-row justify-around items-center">
                    <p className="text-center text-xs ml-1">File: {fileName}</p>
                    <FileInput
                      name="first"
                      accept=".pdf"
                      id="pdf"
                      onChange={(file) => {
                        fileRef.current = file
                        setFileName(file?.[0].name || '')
                      }}
                      className="ml-2"
                    >
                      <Button
                        onClick={() => document.getElementById('pdf')?.click()}
                      >
                        Re-Upload
                      </Button>
                    </FileInput>
                  </div>
                ) : (
                  <FileInput
                    name="first"
                    accept=".pdf"
                    id="pdf"
                    onChange={(file) => {
                      fileRef.current = file
                      setFileName(file?.[0].name || '')
                    }}
                    className="ml-2"
                  >
                    <Button
                      onClick={() => document.getElementById('pdf')?.click()}
                    >
                      Upload any PDF
                    </Button>
                  </FileInput>
                )}
              </div>

              <Button
                onClick={() => searchFromAPI(searchTerm)}
                m={2}
                backgroundColor={'#fff'}
                variant="outline"
                colorScheme="teal"
              >
                Submit
              </Button>
              {errorMessage && (
                <div className="text-red-500 text-center font-sans text-md bg-white">
                    {errorMessage}{" "}
                </div>
            )}
              {loading ? (
                <>
                  <div className="text-center mt-4">
                    Estimated wait time: less than 5 minutes
                  </div>
                  <Lottie
                    animationData={animationData}
                    className="scale-125"
                    style={{ height: '100px' }}
                  />
                </>
              ) : completion === '' ? null : (
                <>
                  <div className="m-4 whitespace-pre-wrap">{completion}</div>
                  <a className="underline ml-4" onClick={toggleOpen}>
                    Click for Additional Analysis
                  </a>
                  {isOpen && (
                    <div className="m-4 whitespace-pre-wrap">{context}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* </Box> */}
    </>
  )
}
