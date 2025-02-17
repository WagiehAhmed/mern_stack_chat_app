import React, { useState, useEffect, useRef } from "react";
import { IconButton } from "./basicComponents";
// icons
import { VscDebugContinue } from "react-icons/vsc";
import { VscDebugPause } from "react-icons/vsc";
import { VscDebugStart } from "react-icons/vsc";
import { LuAudioLines } from "react-icons/lu";
import { MdDone } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useTranslation } from "react-i18next";

const AudioRecorder = ({ setAudio }) => {
  const { t } = useTranslation();
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isBeacking, setIsBreaking] = useState(false);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    prepareRecording();
    setIsRecording(true);
    setIsComplete(false);

    return () => {
      mediaRecorderRef?.current?.stop();
      setAudioBlob(null);
      setIsRecording(false);
      setIsComplete(true);
      setAudio(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track?.stop());
      }
    };
  }, []);

  // prepare
  const prepareRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef?.current?.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef?.current, {
            type: "audio/wav",
          });
          setAudioBlob(blob);
          setAudio(blob);
        };
        mediaRecorderRef.current.start();
      })
      .catch((err) => console.error("Error accessing microphone", err));
  };
  // start
  const startRecording = () => {
    setIsRecording(true);
    setIsComplete(false);
  };
  // finish
  const finishRecording = () => {
    mediaRecorderRef?.current?.stop();
    setIsRecording(false);
    setIsComplete(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track?.stop());
    }
  };
  // delete
  const deleteRecording = () => {
    setAudio(null);
    setAudioBlob(null);
    setIsComplete(false);
    setIsRecording(false);
    audioChunksRef.current = [];
  };
  // stop
  const stopRecording = () => {
    setIsBreaking(true);
    mediaRecorderRef?.current?.stop();
  };
  // continue
  const continueRecording = () => {
    mediaRecorderRef?.current?.start();
    setIsBreaking(false);
  };

  return (
    <div className="w-full flex flex-row-reverse justify-between items-center">
      <div className="w-fit h-fit">
        {isRecording ? (
          <>
            <IconButton className="m-2  border-2 border-accent animate-pulse">
              <LuAudioLines size={20} />
            </IconButton>
            <IconButton
              className="m-2  border-2 border-accent"
              onClick={finishRecording}
              title={t("finish")}
            >
              <MdDone size={20} />
            </IconButton>
            {isBeacking ? (
              <IconButton
                className="m-2  border-2 border-accent"
                onClick={continueRecording}
                title={t("continue")}
              >
                <VscDebugContinue size={20} />
              </IconButton>
            ) : (
              <IconButton
                className="m-2  border-2 border-accent"
                onClick={stopRecording}
                title={t("pause")}
              >
                <VscDebugPause size={20} />
              </IconButton>
            )}
          </>
        ) : isComplete ? (
          <IconButton
            className="m-2  border-2 border-accent"
            onClick={deleteRecording}
            title={t("delete")}
          >
            <MdDelete size={20} />
          </IconButton>
        ) : (
          <IconButton
            className="m-2  border-2 border-accent"
            title={t("start")}
            onClick={() => {
              prepareRecording();
              startRecording();
            }}
          >
            <VscDebugStart size={20} />
          </IconButton>
        )}
      </div>
      {audioBlob && isComplete && !isRecording && (
        <audio
          controls
          ref={audioRef}
          className="w-full max-h-10"
          src={URL.createObjectURL(audioBlob)}
        />
      )}
    </div>
  );
};

export default AudioRecorder;
