import 'dart:async';
import 'package:audioplayers/audioplayers.dart';

enum AudioTrackMode {
  instrumental,
  vocals,
}

class AudioPlayerService {
  final AudioPlayer _player = AudioPlayer();

  AudioTrackMode _currentMode = AudioTrackMode.instrumental;
  String? _instrumentalUrl;
  String? _vocalsUrl;

  final _playerStateController = StreamController<PlayerState>.broadcast();
  final _positionController = StreamController<Duration>.broadcast();
  final _durationController = StreamController<Duration>.broadcast();

  Stream<PlayerState> get onPlayerStateChanged => _playerStateController.stream;
  Stream<Duration> get onPositionChanged => _positionController.stream;
  Stream<Duration> get onDurationChanged => _durationController.stream;

  AudioTrackMode get currentMode => _currentMode;

  AudioPlayerService() {
    _player.onPlayerStateChanged.listen((state) {
      _playerStateController.add(state);
    });

    _player.onPositionChanged.listen((pos) {
      _positionController.add(pos);
    });

    _player.onDurationChanged.listen((dur) {
      _durationController.add(dur);
    });
  }

  Future<void> loadTracks({
    required String instrumentalUrl,
    String? vocalsUrl,
  }) async {
    _instrumentalUrl = instrumentalUrl;
    _vocalsUrl = vocalsUrl;
    _currentMode = AudioTrackMode.instrumental;

    await _player.setSource(UrlSource(instrumentalUrl));
  }

  Future<void> play() async {
    await _player.resume();
  }

  Future<void> pause() async {
    await _player.pause();
  }

  Future<void> seek(Duration position) async {
    await _player.seek(position);
  }

  /// Switch between Instrumental (Karaoke) and Vocals
  Future<void> switchMode(AudioTrackMode mode) async {
    if (_currentMode == mode) return;

    final currentPosition = await _player.getCurrentPosition() ?? Duration.zero;
    final isPlaying = _player.state == PlayerState.playing;

    _currentMode = mode;
    final targetUrl = (mode == AudioTrackMode.instrumental)
        ? _instrumentalUrl
        : _vocalsUrl;

    if (targetUrl != null) {
      await _player.setSource(UrlSource(targetUrl));
      await _player.seek(currentPosition);
      if (isPlaying) {
        await _player.resume();
      }
    }
  }

  Future<void> setVolume(double volume) async {
    await _player.setVolume(volume.clamp(0.0, 1.0));
  }

  Future<void> dispose() async {
    await _player.dispose();
    await _playerStateController.close();
    await _positionController.close();
    await _durationController.close();
  }
}
