import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';

const obs = new OBSWebSocket();

try {
  await obs.connect("ws://127.0.0.1:4455", undefined, {eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters});
  console.log(`Success! We're connected & authenticated.`);

  // Listen for volume changes
  obs.on("InputVolumeMeters", async (data) => {
    // Find the 'Desktop Audio' input
    const desktopAudioInput = data.inputs.find(input => input.inputName === 'Desktop Audio');
    if (!desktopAudioInput) {
      console.log('Desktop Audio input not found');
      return;
    }
  
    const volumeLevel = desktopAudioInput.inputLevelsMul[0];
    const inputLevelsFlattened = [].concat(...desktopAudioInput.inputLevelsMul);
    console.log(desktopAudioInput.inputLevelsMul);
    const maxVolumeLevel = Math.max(...inputLevelsFlattened);
    console.log(`Volume level for Desktop Audio: ${volumeLevel}`);
    console.log(`Max Volume level for Desktop Audio: ${maxVolumeLevel}`);
  
    // Calculate hue based on volume level
    let hue;
    /*if (maxVolumeLevel >  0.7) {
      hue =  180; // Red hue
    } else if (maxVolumeLevel >  0.4) {
      hue =  90; // Yellow hue
    } else {
      hue =  0; // No hue change
    }*/
    hue = maxVolumeLevel * 500 - 180
    let saturation = (maxVolumeLevel * 4) + 0.25;

    console.log(`Hue: ${hue}`);
  
    // Update the color filter of the image source
    await obs.call("SetSourceFilterSettings", {
      sourceName: "kf_logo",
      filterName: "color",
      filterSettings: {
        contrast: saturation,
        saturation: saturation
      },
      overlay: false
    });
    await obs.call("SetSourceFilterSettings", {
      sourceName: "cavalier",
      filterName: "color",
      filterSettings: {
        contrast: saturation,
        saturation: saturation
      },
      overlay: false
    });
  });
  obs.on("SourceFilterSettingsChanged", async (data) => {
    console.log(data);
  });
} catch (err) {
  console.error(`Error: ${err}`);
}
