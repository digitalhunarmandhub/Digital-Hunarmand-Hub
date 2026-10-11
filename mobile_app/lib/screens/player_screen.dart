import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:share_plus/share_plus.dart';
import '../models/song_job.dart';
import '../services/api_service.dart';
import '../services/audio_player_service.dart';
import '../widgets/waveform_visualizer.dart';

class PlayerScreen extends StatefulWidget {
  final SongJob songJob;

  const PlayerScreen({super.key, required this.songJob});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  final AudioPlayerService _audioService = AudioPlayerService();
  final ApiService _apiService = ApiService();

  bool _isPlaying = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  AudioTrackMode _selectedMode = AudioTrackMode.instrumental;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  void _initPlayer() async {
    if (widget.songJob.instrumentalUrl != null) {
      await _audioService.loadTracks(
        instrumentalUrl: widget.songJob.instrumentalUrl!,
        vocalsUrl: widget.songJob.vocalsUrl,
      );
    }

    _audioService.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });

    _audioService.onPositionChanged.listen((pos) {
      if (mounted) setState(() => _position = pos);
    });

    _audioService.onDurationChanged.listen((dur) {
      if (mounted) setState(() => _duration = dur);
    });
  }

  @override
  void dispose() {
    _audioService.dispose();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(d.inMinutes.remainder(60));
    final seconds = twoDigits(d.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  void _togglePlayPause() {
    if (_isPlaying) {
      _audioService.pause();
    } else {
      _audioService.play();
    }
  }

  void _switchTrack(AudioTrackMode mode) {
    setState(() => _selectedMode = mode);
    _audioService.switchMode(mode);
  }

  Future<void> _downloadAndSave() async {
    if (widget.songJob.instrumentalUrl == null) return;
    setState(() => _isDownloading = true);

    try {
      final path = await _apiService.downloadInstrumental(
        widget.songJob.instrumentalUrl!,
        widget.songJob.title,
      );
      widget.songJob.localInstrumentalPath = path;

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF10B981),
            content: Text("Instrumental downloaded to:\n$path"),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text("Download error: $e"),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isDownloading = false);
    }
  }

  Future<void> _shareTrack() async {
    if (widget.songJob.localInstrumentalPath != null) {
      await Share.shareXFiles([XFile(widget.songJob.localInstrumentalPath!)],
          text: "Check out this instrumental generated with AI!");
    } else if (widget.songJob.instrumentalUrl != null) {
      await Share.share(
        "Listen to this AI-separated instrumental: ${widget.songJob.instrumentalUrl}",
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Studio Player",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
          child: Column(
            children: [
              const SizedBox(height: 10),

              // Disc / Cover Art container
              Center(
                child: Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const RadialGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF1E1B4B)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withOpacity(_isPlaying ? 0.6 : 0.2),
                        blurRadius: 30,
                        spreadRadius: 4,
                      )
                    ],
                  ),
                  child: Center(
                    child: Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: Color(0xFF0F172A),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _selectedMode == AudioTrackMode.instrumental
                            ? Icons.music_note
                            : Icons.mic,
                        color: const Color(0xFF38BDF8),
                        size: 40,
                      ),
                    ),
                  ),
                ).animate(target: _isPlaying ? 1 : 0).scale(
                      begin: const Offset(0.96, 0.96),
                      end: const Offset(1.02, 1.02),
                      duration: 800.ms,
                      curve: Curves.easeInOut,
                    ),
              ),

              const SizedBox(height: 24),

              // Song Title & Metadata
              Text(
                widget.songJob.title,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _selectedMode == AudioTrackMode.instrumental
                      ? "✨ AI Instrumental Mode"
                      : "🎙️ Isolated Vocals Mode",
                  style: const TextStyle(
                    color: Color(0xFF38BDF8),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Animated Waveform
              WaveformVisualizer(
                isPlaying: _isPlaying,
                barColor: _selectedMode == AudioTrackMode.instrumental
                    ? const Color(0xFF38BDF8)
                    : const Color(0xFFA855F7),
              ),

              const SizedBox(height: 16),

              // Track Selector Toggle: Instrumental vs Vocals
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _switchTrack(AudioTrackMode.instrumental),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedMode == AudioTrackMode.instrumental
                                ? const Color(0xFF2563EB)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          alignment: Alignment.center,
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.piano, size: 18, color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                "Instrumental",
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _switchTrack(AudioTrackMode.vocals),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedMode == AudioTrackMode.vocals
                                ? const Color(0xFF9333EA)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          alignment: Alignment.center,
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.mic_none, size: 18, color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                "Vocals Only",
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Audio Scrubber / Slider
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                  trackHeight: 3,
                  activeTrackColor: const Color(0xFF38BDF8),
                  inactiveTrackColor: Colors.white12,
                  thumbColor: Colors.white,
                ),
                child: Slider(
                  value: _position.inMilliseconds
                      .clamp(0, _duration.inMilliseconds)
                      .toDouble(),
                  max: (_duration.inMilliseconds > 0 ? _duration.inMilliseconds : 1)
                      .toDouble(),
                  onChanged: (val) {
                    _audioService.seek(Duration(milliseconds: val.toInt()));
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_formatDuration(_position),
                        style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    Text(_formatDuration(_duration),
                        style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                ),
              ),

              // Player Controls (Rewind, Play/Pause, Fast Forward)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    iconSize: 32,
                    icon: const Icon(Icons.replay_10, color: Colors.white70),
                    onPressed: () {
                      final newPos = _position - const Duration(seconds: 10);
                      _audioService.seek(newPos < Duration.zero ? Duration.zero : newPos);
                    },
                  ),
                  const SizedBox(width: 20),
                  GestureDetector(
                    onTap: _togglePlayPause,
                    child: Container(
                      width: 68,
                      height: 68,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF38BDF8), Color(0xFF2563EB)],
                        ),
                      ),
                      child: Icon(
                        _isPlaying ? Icons.pause : Icons.play_arrow,
                        color: Colors.white,
                        size: 36,
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  IconButton(
                    iconSize: 32,
                    icon: const Icon(Icons.forward_10, color: Colors.white70),
                    onPressed: () {
                      final newPos = _position + const Duration(seconds: 10);
                      if (newPos < _duration) _audioService.seek(newPos);
                    },
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Download and Share Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _isDownloading ? null : _downloadAndSave,
                      icon: _isDownloading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.download, size: 20, color: Color(0xFF38BDF8)),
                      label: Text(_isDownloading ? "Saving..." : "Save Instrumental"),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      padding: const EdgeInsets.all(14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _shareTrack,
                    child: const Icon(Icons.share, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
