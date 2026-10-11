import 'dart:math';
import 'package:flutter/material.dart';

class WaveformVisualizer extends StatefulWidget {
  final bool isPlaying;
  final Color barColor;
  final int barCount;

  const WaveformVisualizer({
    super.key,
    required this.isPlaying,
    this.barColor = const Color(0xFF00FFCC),
    this.barCount = 28,
  });

  @override
  State<WaveformVisualizer> createState() => _WaveformVisualizerState();
}

class _WaveformVisualizerState extends State<WaveformVisualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final Random _random = Random();
  late List<double> _heights;

  @override
  void initState() {
    super.initState();
    _heights = List.generate(widget.barCount, (index) => 0.2 + _random.nextDouble() * 0.8);
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    )..addListener(() {
        if (widget.isPlaying) {
          setState(() {
            _heights = List.generate(
              widget.barCount,
              (index) => 0.15 + _random.nextDouble() * 0.85,
            );
          });
        }
      });

    if (widget.isPlaying) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(WaveformVisualizer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying && !_controller.isAnimating) {
      _controller.repeat(reverse: true);
    } else if (!widget.isPlaying && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 90,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(widget.barCount, (index) {
          final heightFactor = widget.isPlaying ? _heights[index] : 0.15;
          return AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 4,
            height: 80 * heightFactor,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  widget.barColor.withOpacity(0.4),
                  widget.barColor,
                ],
              ),
              borderRadius: BorderRadius.circular(4),
              boxShadow: widget.isPlaying
                  ? [
                      BoxShadow(
                        color: widget.barColor.withOpacity(0.5),
                        blurRadius: 6,
                        spreadRadius: 1,
                      )
                    ]
                  : [],
            ),
          );
        }),
      ),
    );
  }
}
