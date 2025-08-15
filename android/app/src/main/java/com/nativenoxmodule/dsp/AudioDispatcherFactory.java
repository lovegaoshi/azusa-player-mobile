/*
 *      _______                       _____   _____ _____
 *     |__   __|                     |  __ \ / ____|  __ \
 *        | | __ _ _ __ ___  ___  ___| |  | | (___ | |__) |
 *        | |/ _` | '__/ __|/ _ \/ __| |  | |\___ \|  ___/
 *        | | (_| | |  \__ \ (_) \__ \ |__| |____) | |
 *        |_|\__,_|_|  |___/\___/|___/_____/|_____/|_|
 *
 * -------------------------------------------------------------
 *
 * TarsosDSP is developed by Joren Six at IPEM, University Ghent
 *
 * -------------------------------------------------------------
 *
 *  Info: http://0110.be/tag/TarsosDSP
 *  Github: https://github.com/JorenSix/TarsosDSP
 *  Releases: http://0110.be/releases/TarsosDSP/
 *
 *  TarsosDSP includes modified source code by various authors,
 *  for credits and info, see README.
 *
 */

// shamelessly copied from https://github.com/H-Fontaine/Android-TarsosDSP/blob/master/dsp/src/main/java/be/tarsos/dsp/io/android/AudioDispatcherFactory.java.
// credits go to the original authors.

package com.nativenoxmodule.dsp;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.FFmpegKitConfig;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

import be.tarsos.dsp.AudioDispatcher;
import be.tarsos.dsp.io.TarsosDSPAudioFormat;
import be.tarsos.dsp.io.TarsosDSPAudioInputStream;
import be.tarsos.dsp.io.UniversalAudioInputStream;

/**
 * The Factory creates {@link AudioDispatcher} objects from the
 * configured default microphone of an Android device.
 * It depends on the android runtime and does not work on the standard Java runtime.
 *
 * @author Joren Six
 * @see AudioDispatcher
 */
public class AudioDispatcherFactory {
    static private final String TAG = "AudioDispatcherFactory";
    static private int pipe_counter = 1;

    /**
     * Create a stream from a piped sub process and use that to create a new
     * {@link AudioDispatcher} The sub-process writes a WAV-header and
     * PCM-samples to standard out. The header is ignored and the PCM samples
     * are are captured and interpreted. Examples of executables that can
     * convert audio in any format and write to stdout are ffmpeg and avconv.
     *
     * @param context
     * 			  The context from witch comes the Uri path
     * @param begin
     * 			  Start time from which we read the file in seconds
     * @param duration
     * 			  Number of seconds read from the start time (begin) if negative read the entire file
     * @param selectedFileUri
     *            The file or stream to capture.
     * @param targetSampleRate
     *            The target sample rate.
     * @param audioBufferSize
     *            The number of samples used in the buffer.
     * @param bufferOverlap
     * 			  The number of samples to overlap the current and previous buffer.
     * @return A new audioprocessor.
     */
    public static AudioDispatcher fromPipe(Context context, Uri selectedFileUri, double begin, double duration, final int targetSampleRate, final int audioBufferSize, final int bufferOverlap) throws FileNotFoundException {
        String inputFile = FFmpegKitConfig.getSafParameterForRead(context, selectedFileUri);
        String outputFile = registerNewPipe(context);

        if (duration > 0) {
            FFmpegKit.execute("-y -ss " + begin + " -t " + duration + " -i " + inputFile + " -f s16le -acodec pcm_s16le -ar " + targetSampleRate + " -ac 1 " + outputFile);
            Log.d(TAG, "Read the file from " + begin + "s to " + (duration + begin) + " s");
        } else {
            FFmpegKit.execute("-y -ss " + begin + " -i " + inputFile + " -f s16le -acodec pcm_s16le -ar " + targetSampleRate + " -ac 1 " + outputFile);
            Log.d(TAG, "Read the file from " + begin + "s to the end");
        }

        TarsosDSPAudioInputStream audioStream = new UniversalAudioInputStream(new FileInputStream(outputFile), new TarsosDSPAudioFormat(targetSampleRate, 16, 1, true, false));
        return new AudioDispatcher(audioStream, audioBufferSize, bufferOverlap);
    }

    public static AudioDispatcher fromInputStream(InputStream stream, final int targetSampleRate, final int sampleSizeInBits, final int number_of_channel, final Boolean signed, final Boolean bigEndian, final int audioBufferSize, final int bufferOverlap) {
        TarsosDSPAudioInputStream audioStream = new UniversalAudioInputStream(stream, new TarsosDSPAudioFormat(targetSampleRate, sampleSizeInBits, number_of_channel, signed, bigEndian));
        return new AudioDispatcher(audioStream, audioBufferSize, bufferOverlap);
    }

    public static String registerNewPipe(final Context context) {
        // PIPES ARE CREATED UNDER THE PIPES DIRECTORY
        final File cacheDir = context.getCacheDir();
        final File pipesDir = new File(cacheDir, "pipes");

        if (!pipesDir.exists()) {
            final boolean pipesDirCreated = pipesDir.mkdirs();
            if (!pipesDirCreated) {
                Log.e(TAG, String.format("Failed to create pipes directory: %s.", pipesDir.getAbsolutePath()));
                return null;
            }
        }

        final String newFFmpegPipePath = pipesDir +"/pipe"  + pipe_counter;
        pipe_counter += 1;

        // FIRST CLOSE OLD PIPES WITH THE SAME NAME
        closePipe(newFFmpegPipePath);

        return newFFmpegPipePath;
    }

    public static void closePipe(final String ffmpegPipePath) {
        final File file = new File(ffmpegPipePath);
        if (file.exists()) {
            file.delete();
            Log.d(TAG, "Pipe deleted : " + ffmpegPipePath);
        }
    }
}


