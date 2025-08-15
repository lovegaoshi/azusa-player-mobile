package com.nativenoxmodule


import be.tarsos.dsp.beatroot.BeatRootOnsetEventHandler
import be.tarsos.dsp.io.jvm.AudioDispatcherFactory
import be.tarsos.dsp.onsets.ComplexOnsetDetector
import timber.log.Timber


const val SAMPLE_RATE = 22050
const val BUFFER_SIZE = 1024
const val BUFFER_OVERLAP = BUFFER_SIZE / 2

// https://github.com/musicretrieval/BeatsBear/blob/b4ddfc8dcc354d0df8f4e1f5a97b6b3edc389efa/app/src/main/java/com/musicretrieval/beatsbear/Activities/MainActivity.java#L414
// https://github.com/JorenSix/TarsosDSP/blob/052f429ecd0091103cdeaa495e3f3bb46542f8dd/examples/src/main/java/be/tarsos/dsp/example/cli/feature_extractor/BeatExtractor.java#L4

fun beatRoot(path: String) {
    try {
        // HACK: i have no idea what these means
        val onsetList = ArrayList<Double>()
        val dispatcher = AudioDispatcherFactory.fromPipe(
            path, SAMPLE_RATE, BUFFER_SIZE, BUFFER_OVERLAP)

        val detector = ComplexOnsetDetector(BUFFER_SIZE)
        val handler = BeatRootOnsetEventHandler()
        detector.setHandler(handler)

        dispatcher.addAudioProcessor(detector)
        dispatcher.run()

        handler.trackBeats { time, salience ->
            // salience is ignored because this is always -1
            onsetList.add(time)
        }
        Timber.tag("APM").d("beats of $path: $onsetList")
    } catch (e: Exception) {
        Timber.tag("APM").e("beats error! $e")
    }

}