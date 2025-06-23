import os
import subprocess

# 🔧 Imposta qui la percentuale di compressione desiderata
COMPRESSION_PERCENT = 30  # ad esempio: 20 significa 20% del bitrate originale

def get_video_bitrate(input_file):
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=bit_rate",
        "-of", "default=noprint_wrappers=1:nokey=1",
        input_file
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    bitrate = result.stdout.strip()
    return int(bitrate) / 1000 if bitrate else None  # ritorna kbps

def compress_video(input_file, output_file, compression_percent):
    original_bitrate = get_video_bitrate(input_file)

    if original_bitrate is None:
        print(f"⚠️ Impossibile leggere il bitrate di {input_file}. Saltato.")
        return

    target_bitrate = original_bitrate * (compression_percent / 100)

    cmd = [
        "ffmpeg", "-i", input_file,
        "-b:v", f"{int(target_bitrate)}k",
        "-bufsize", f"{int(target_bitrate * 2)}k",
        "-y", output_file
    ]

    print(f"▶️ Compressione {os.path.basename(input_file)} a {int(target_bitrate)}k...")
    subprocess.run(cmd)
    print(f"✅ Salvato: {output_file}")

def compress_all_videos(compression_percent):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(script_dir, "input_videos")
    output_dir = os.path.join(script_dir, "compressed_videos")

    os.makedirs(output_dir, exist_ok=True)

    video_extensions = (".mp4", ".mov")  # puoi aggiungere .avi, .mkv ecc.

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(video_extensions):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            compress_video(input_path, output_path, compression_percent)

if __name__ == "__main__":
    compress_all_videos(COMPRESSION_PERCENT)
