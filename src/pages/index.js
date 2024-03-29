// pages/index.js
import {
  Container,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
  useToast,
  Spinner,
  Grid,
  Box,
  Tooltip,
  Switch,
  FormHelperText,
  useColorMode,
  IconButton,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import OpenAI from 'openai';
import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [apiKeyInput, setApiKey] = useState('');
  const [model, setModel] = useState('tts-1');
  const [inputText, setInputText] = useState('');
  const [voice, setVoice] = useState('Shimmer');
  const [speed, setSpeed] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    // Clean up the URL object when the component is unmounted or audioUrl changes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const toast = useToast();

  const handleModelToggle = () => {
    setModel(model === 'tts-1' ? 'tts-1-hd' : 'tts-1');
  };

  const handleDownload = () => {
    saveAs(audioUrl, 'speech.mp3'); // This will save the file as "speech.mp3"
  };

  // Assuming `openai.audio.speech.create` returns a stream or binary data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAudioUrl(null);
    try {
      // Define the request headers
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${apiKeyInput}`);
      headers.append('Content-Type', 'application/json');

      // Define the request body
      const body = JSON.stringify({
        model: model,
        input: inputText,
        voice: voice,
        speed: speed.toFixed(1),
      });

      // Make the fetch request to the OpenAI API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response body as Blob
      const blob = await response.blob();

      // Create a URL for the Blob
      const audioUrl = URL.createObjectURL(blob);

      // Update your component's state or context
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'An error occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= 262144) {
      setInputText(e.target.value);
    }
  };

  return (
    <Container maxW="container">
      <Container centerContent p={4} maxW="container.md">
        <Flex direction="column" align="center" justify="center" minH="100vh" w="full">
          <Box
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="lg"
            p={6}
            w="full"
            maxW="md"
          >
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              variant="ghost"
              color="current"
              ml="2"
              fontSize="20px"
              onClick={toggleColorMode}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            />
            <VStack spacing={6} as="form" onSubmit={handleSubmit} width="full" maxW="md">
              <Box bg={colorMode === 'light' ? 'black' : 'gray.600'} w="100%" p={5} borderTopRadius="md" boxShadow="lg">
                <Heading textAlign="center" color={colorMode === 'light' ? 'white' : 'gray.200'}>
                  Open-Audio TTS
                </Heading>
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.100' : 'gray.400'} textAlign="center" mt={2}>
                  Powered by OpenAI TTS
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode === 'light' ? 'gray.100' : 'gray.400'}
                  textAlign="center"
                  mt={2}
                  fontWeight={'700'}
                >
                  <a
                    href="https://github.com/Justmalhar/open-audio"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: colorMode === 'light' ? 'gray.100' : 'gray.400' }}
                  >
                    View on GitHub
                  </a>
                </Text>
              </Box>
              <Grid templateColumns={{ md: '4fr 1fr' }} gap={4} width="full">
                <FormControl isRequired>
                  <FormLabel htmlFor="api-key">API Key</FormLabel>
                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                    sk-x3UKCid6kJYa9FZp327rneT3BlbkFJaf6aMp4odqXsdbNxxq8W
                  </Text>
                  <Input
                    id="api-key"
                    placeholder="Enter your OpenAI API key"
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKey(e.target.value)}
                    variant="outline"
                    borderColor={colorMode === 'light' ? 'black' : 'gray.600'}
                    _hover={{ borderColor: colorMode === 'light' ? 'gray.400' : 'gray.500' }}
                  />
                </FormControl>

                <FormControl>
                  <VStack align="start" spacing={0}>
                    <FormLabel htmlFor="model">Quality</FormLabel>
                    <HStack align="center" h="100%" mx="0" mt="2">
                      <Switch
                        id="model"
                        colorScheme={colorMode === 'light' ? 'blackAlpha' : 'whiteAlpha'}
                        isChecked={model === 'tts-1-hd'}
                        onChange={handleModelToggle}
                        size="md"
                      />
                      <FormHelperText textAlign="center" mt={'-1'}>
                        {model === 'tts-1' ? 'High' : 'HD'}
                      </FormHelperText>
                    </HStack>
                  </VStack>
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel htmlFor="input-text">Input Text</FormLabel>
                <Textarea
                  id="input-text"
                  placeholder="Enter the text you want to convert to speech"
                  value={inputText}
                  onChange={handleInputChange}
                  resize="vertical"
                  maxLength={262144}
                  borderColor={colorMode === 'light' ? 'black' : 'gray.600'}
                  _hover={{ borderColor: colorMode === 'light' ? 'gray.400' : 'gray.500' }}
                />
                <Box textAlign="right" fontSize="sm">
                  <Text>
                    {inputText.length} / 262144
                  </Text>
                  <Text>
                    Cost: $
                    {(() => {
                      const length = inputText.length;
                      if (model === 'tts-1') {
                        if (length <= 999) return 0.015;
                        else if (length <= 1000) return 0.03;
                        else if (length <= 2500) return 0.045;
                        else if (length <= 4096) return 0.075;
                        else return (length * 0.015 / 1000).toFixed(3);
                      } else {
                        if (length <= 999) return 0.03;
                        else if (length <= 1000) return 0.06;
                        else if (length <= 2500) return 0.09;
                        else if (length <= 4096) return 0.15;
                        else return (length * 0.03 / 1000).toFixed(3);
                      }
                    })()}
                  </Text>
                </Box>
              </FormControl>

              <HStack width="full" justifyContent="space-between">
                <FormControl isRequired width="45%">
                  <FormLabel htmlFor="voice">Voice</FormLabel>
                  <Select
                    id="voice"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    variant="outline"
                    placeholder="Select voice"
                    borderColor={colorMode === 'light' ? 'black' : 'gray.600'}
                    focusBorderColor={colorMode === 'light' ? 'black' : 'gray.600'}
                    colorScheme={colorMode === 'light' ? 'blackAlpha' : 'whiteAlpha'}
                    _hover={{ borderColor: colorMode === 'light' ? 'gray.400' : 'gray.500' }}
                  >
                    {/* List of supported voices */}
                    <option value="shimmer">Shimmer</option>
                    <option value="onyx">Onyx</option>
                    <option value="alloy">Alloy</option>
                    <option value="echo">Echo</option>
                    <option value="fable">Fable</option>
                    <option value="nova">Nova</option>
                  </Select>
                </FormControl>

                <FormControl width="40%" mt="-15">
                  <FormLabel htmlFor="speed">Speed </FormLabel>
                  <Slider
                    id="speed"
                    defaultValue={1}
                    min={0.25}
                    max={4}
                    step={0.25}
                    onChange={(v) => setSliderValue(v)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    ref={sliderRef}
                    aria-label="slider-ex-1"
                  >
                    <SliderTrack bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}>
                      <SliderFilledTrack bg={colorMode === 'light' ? 'black' : 'gray.400'} />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg={colorMode === 'light' ? 'black' : 'gray.600'}
                      color={colorMode === 'light' ? 'white' : 'gray.200'}
                      placement="bottom"
                      isOpen={showTooltip}
                      label={`${sliderValue.toFixed(2)}x`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </FormControl>
              </HStack>

              <Button
                size="lg"
                bg={colorMode === 'light' ? 'black' : 'gray.600'}
                color={colorMode === 'light' ? 'white' : 'gray.200'}
                colorScheme={colorMode === 'light' ? 'black' : 'gray'}
                borderColor={colorMode === 'light' ? 'black' : 'gray.600'}
                type="submit"
                isLoading={isSubmitting}
                loadingText="Generating..."
              >
                Create Speech
              </Button>

              {isSubmitting && (
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                  color={colorMode === 'light' ? 'black' : 'gray.400'}
                  size="md"
                />
              )}
              {audioUrl && (
                <>
                  <audio controls src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                  <Button onClick={handleDownload}>Download MP3</Button>
                </>
              )}
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Container>
  );
}
