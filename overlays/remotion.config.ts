import {Config} from '@remotion/cli/config';

// PNG frames keep the alpha channel, which is what makes the ProRes 4444
// exports drop straight onto a timeline with a transparent background.
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
