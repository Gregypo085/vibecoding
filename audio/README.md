# Audio Files

## Structure

Each key folder should contain 4 audio files:
- `drums.ogg`
- `bass.ogg`
- `pad.ogg`
- `arp.ogg`

## Creating Audio Files in Reason

### 1. Set Your Tempo
Choose a tempo (e.g., 90 BPM) and stick with it for all stems in a key.

### 2. Create Your Loops
- Make each loop 4, 8, or 16 bars long
- Ensure they loop perfectly (no clicks/pops at the loop point)
- Keep all stems in the same key and tempo

### 3. Export from Reason
1. Solo the track you want to export
2. Export as WAV (24-bit, 48kHz or 44.1kHz)
3. Trim to exact loop length (no silence at start/end)
4. Verify the loop point is perfect

### 4. Convert to OGG
Use a tool like Audacity or ffmpeg to convert WAV to OGG:

```bash
ffmpeg -i drums.wav -c:a libvorbis -q:a 6 drums.ogg
```

Quality flag (-q:a):
- 6 = good quality/size balance (~128 kbps)
- 8 = higher quality (~256 kbps)

### 5. Place Files
Put the OGG files in the appropriate key folder:
- `audio/key-c/` for C Major
- `audio/key-d/` for D Major
- `audio/key-e/` for E Major
- `audio/key-g/` for G Major
- `audio/key-a/` for A Minor

## Tips
- Keep file sizes reasonable (< 500KB per stem if possible)
- Test loops in a DAW before exporting to ensure perfect looping
- All stems in a key should be musically compatible
- Consider adding some variety - not every stem needs to be playing constantly
