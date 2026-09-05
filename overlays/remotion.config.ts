import {Config} from '@remotion/cli/config';

// PNG frames keep the alpha channel, which is what makes the ProRes 4444
// exports drop straight onto a timeline with a transparent background.
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Spec §1: "Audio: None". Remotion adds a silent PCM track by default, so
// enforcement is turned off - otherwise every delivered .mov carries an
// empty audio stream.
Config.setEnforceAudioTrack(false);
