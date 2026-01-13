# VibeCoding

Generative ambient music for deep work and coding sessions.

## Concept

VibeCoding creates ever-evolving soundscapes by layering musical elements (drums, bass, pads, arps) that fade in and out. Users can select a musical key and control which elements can appear in the mix.

## Features

- **Multiple Keys**: Choose from different musical keys (C, D, E, G, A minor)
- **Layered Stems**: Control drums, bass, pads, and arps independently
- **Smooth Fading**: Elements fade in/out over 2 seconds for seamless transitions
- **Individual Controls**: Adjust volume for each stem
- **Master Volume**: Overall mix control
- **Web Audio API**: High-quality, low-latency audio playback

## Tech Stack

- Pure vanilla JavaScript
- Web Audio API for audio playback and mixing
- No backend required - fully client-side
- CSS custom properties for theming

## Current Status

**Proof of Concept** - Manual control mode where you toggle stems on/off

## Roadmap

- [ ] Add audio files for at least one key
- [ ] Implement probability-based auto-generation
- [ ] Add more keys and musical styles
- [ ] Visual feedback improvements
- [ ] User presets/saved configurations
- [ ] More stem types (strings, fx, etc.)
- [ ] Deploy to gostnode.com/vibecoding

## Development

1. Clone the repo
2. Add audio files to `audio/key-*/` folders (see `audio/README.md`)
3. Open `index.html` in a browser or use a local server:
   ```bash
   python3 -m http.server 8000
   ```

## Audio Creation

See `audio/README.md` for detailed instructions on creating and exporting audio files from your DAW.

## License

A [GostNode](https://gostnode.com) project
