import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../models/song_job.dart';

class ApiService {
  // For Android Emulator use 10.0.2.2, for physical device use your PC's LAN IP e.g. 192.168.1.X
  static String baseUrl = "http://10.0.2.2:8000";

  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(minutes: 5),
  ));

  /// Uploads audio file and returns the job ID
  Future<String> uploadSong({
    required File file,
    required void Function(double progress) onProgress,
  }) async {
    try {
      String fileName = file.path.split(Platform.pathSeparator).last;

      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post(
        "$baseUrl/api/upload",
        data: formData,
        onSendProgress: (sent, total) {
          if (total > 0) {
            // Upload takes first 40% of the bar
            double uploadProgress = (sent / total) * 0.40;
            onProgress(uploadProgress);
          }
        },
      );

      if (response.statusCode == 200 && response.data['job_id'] != null) {
        return response.data['job_id'];
      } else {
        throw Exception("Server rejected audio upload: ${response.data}");
      }
    } catch (e) {
      throw Exception("Failed to upload song: $e");
    }
  }

  /// Polls status until completed or failed
  Future<SongJob> pollJobStatus({
    required String jobId,
    required SongJob currentJob,
    required void Function(double progress, String statusText) onUpdate,
  }) async {
    bool isDone = false;
    int retries = 0;
    const maxRetries = 150; // 5 minutes max polling

    while (!isDone && retries < maxRetries) {
      await Future.delayed(const Duration(seconds: 2));
      retries++;

      try {
        final response = await _dio.get("$baseUrl/api/status/$jobId");
        if (response.statusCode == 200) {
          final data = response.data;
          String status = data['status'];
          int backendProgress = data['progress'] ?? 0;

          // Map backend progress (0-100) to UI progress (40% - 100%)
          double overallProgress = 0.40 + (backendProgress / 100.0) * 0.60;

          if (status == 'completed') {
            currentJob.status = JobStatus.completed;
            currentJob.progress = 1.0;
            currentJob.instrumentalUrl = "$baseUrl${data['instrumental_url']}";
            currentJob.vocalsUrl = "$baseUrl${data['vocals_url']}";
            onUpdate(1.0, "Ready!");
            isDone = true;
            return currentJob;
          } else if (status == 'failed') {
            currentJob.status = JobStatus.failed;
            currentJob.errorMessage = data['error'] ?? "Unknown separation error";
            onUpdate(1.0, "Failed");
            throw Exception(currentJob.errorMessage);
          } else {
            currentJob.status = JobStatus.processing;
            currentJob.progress = overallProgress;
            onUpdate(overallProgress, "Separating vocals & instruments ($backendProgress%)...");
          }
        }
      } catch (e) {
        if (e is! Exception) rethrow;
      }
    }

    throw Exception("Job timed out while separating audio.");
  }

  /// Downloads the instrumental track to local device storage
  Future<String> downloadInstrumental(String instrumentalUrl, String songTitle) async {
    final dir = await getApplicationDocumentsDirectory();
    final cleanTitle = songTitle.replaceAll(RegExp(r'[^\w\s\.-]'), '_');
    final filePath = "${dir.path}/Instrumental_$cleanTitle.mp3";

    await _dio.download(instrumentalUrl, filePath);
    return filePath;
  }
}
