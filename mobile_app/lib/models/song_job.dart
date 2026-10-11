enum JobStatus {
  idle,
  uploading,
  processing,
  completed,
  failed,
}

class SongJob {
  final String id;
  final String title;
  final String originalPath;
  final int fileSizeBytes;
  JobStatus status;
  double progress; // 0.0 to 1.0
  String? instrumentalUrl;
  String? vocalsUrl;
  String? localInstrumentalPath;
  String? errorMessage;
  final DateTime createdAt;

  SongJob({
    required this.id,
    required this.title,
    required this.originalPath,
    required this.fileSizeBytes,
    this.status = JobStatus.idle,
    this.progress = 0.0,
    this.instrumentalUrl,
    this.vocalsUrl,
    this.localInstrumentalPath,
    this.errorMessage,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  String get fileSizeFormatted {
    if (fileSizeBytes <= 0) return "0 MB";
    double mb = fileSizeBytes / (1024 * 1024);
    return "${mb.toStringAsFixed(1)} MB";
  }

  factory SongJob.fromJson(Map<String, dynamic> json) {
    return SongJob(
      id: json['job_id'] ?? '',
      title: json['original_filename'] ?? 'Untitled Song',
      originalPath: json['input_path'] ?? '',
      fileSizeBytes: json['file_size'] ?? 0,
      status: _parseStatus(json['status']),
      progress: (json['progress'] ?? 0) / 100.0,
      instrumentalUrl: json['instrumental_url'],
      vocalsUrl: json['vocals_url'],
      errorMessage: json['error'],
    );
  }

  static JobStatus _parseStatus(String? status) {
    switch (status) {
      case 'queued':
      case 'processing':
        return JobStatus.processing;
      case 'completed':
        return JobStatus.completed;
      case 'failed':
        return JobStatus.failed;
      default:
        return JobStatus.idle;
    }
  }
}
