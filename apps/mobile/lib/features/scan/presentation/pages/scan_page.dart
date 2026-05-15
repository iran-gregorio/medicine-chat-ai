import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/theme/app_theme.dart';

class ScanPage extends StatefulWidget {
  const ScanPage({super.key});

  @override
  State<ScanPage> createState() => _ScanPageState();
}

class _ScanPageState extends State<ScanPage> {
  final ImagePicker _picker = ImagePicker();
  File? _capturedImage;
  bool _isProcessing = false;

  Future<void> _openCamera() async {
    final status = await Permission.camera.request();
    if (!mounted) return;

    if (status.isGranted) {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 90,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (image != null && mounted) {
        setState(() {
          _capturedImage = File(image.path);
          _isProcessing = true;
        });
        // TODO: send to backend for OCR/analysis
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) setState(() => _isProcessing = false);
      }
    } else if (status.isPermanentlyDenied) {
      if (!mounted) return;
      _showPermissionDeniedDialog(
        title: 'Permissão de câmera negada',
        message: 'Para escanear medicamentos, permita o acesso à câmera nas configurações do dispositivo.',
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Permissão de câmera é necessária para escanear.'),
          backgroundColor: AppTheme.errorRed,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  Future<void> _openGallery() async {
    final status = Platform.isAndroid
        ? await Permission.photos.request()
        : await Permission.photos.request();
    if (!mounted) return;

    if (status.isGranted || status.isLimited) {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
      );
      if (image != null && mounted) {
        setState(() {
          _capturedImage = File(image.path);
          _isProcessing = true;
        });
        // TODO: send to backend for OCR/analysis
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) setState(() => _isProcessing = false);
      }
    } else if (status.isPermanentlyDenied) {
      if (!mounted) return;
      _showPermissionDeniedDialog(
        title: 'Permissão de galeria negada',
        message: 'Para selecionar imagens, permita o acesso à galeria nas configurações do dispositivo.',
      );
    }
  }

  void _showPermissionDeniedDialog({
    required String title,
    required String message,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        content: Text(message, style: const TextStyle(color: AppTheme.textGrey)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            style: ElevatedButton.styleFrom(
              minimumSize: Size.zero,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            child: const Text('Abrir Configurações'),
          ),
        ],
      ),
    );
  }

  void _clearCapture() {
    setState(() {
      _capturedImage = null;
      _isProcessing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera viewfinder or captured image
          Positioned.fill(
            child: _capturedImage != null
                ? Image.file(_capturedImage!, fit: BoxFit.cover)
                : Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF1a2a3a), Color(0xFF0a1520)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Center(child: _ScanFrame()),
                  ),
          ),

          // Processing overlay
          if (_isProcessing)
            Positioned.fill(
              child: Container(
                color: Colors.black.withAlpha(153),
                child: const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: AppTheme.teal),
                      SizedBox(height: 16),
                      Text(
                        'Analisando imagem...',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Top Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.go('/'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(38),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Voltar',
                            style: TextStyle(color: Colors.white, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Escanear',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      if (_capturedImage != null)
                        GestureDetector(
                          onTap: _clearCapture,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(38),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha(38),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.flash_auto_rounded, color: Colors.white, size: 20),
                        ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(38),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.info_outline_rounded, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Bottom Panel
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag handle
                  Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: AppTheme.borderGrey,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  Text(
                    _capturedImage != null
                        ? 'Imagem Capturada'
                        : 'Posicione o Documento',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _capturedImage != null
                        ? 'Toque em atualizar para tirar outra foto ou envie para análise.'
                        : 'Coloque a caixa de medicamento ou receita dentro do quadro. Use boa iluminação e mantenha firme.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textGrey,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _ScanAction(
                        icon: Icons.photo_library_outlined,
                        label: 'Galeria',
                        onTap: _isProcessing ? null : _openGallery,
                      ),
                      // Main capture button
                      GestureDetector(
                        onTap: _isProcessing ? null : _openCamera,
                        child: Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppTheme.teal, AppTheme.tealDark],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.teal.withAlpha(102),
                                blurRadius: 20,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Icon(
                            _capturedImage != null
                                ? Icons.send_rounded
                                : Icons.camera_alt_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                      ),
                      _ScanAction(
                        icon: Icons.help_outline_rounded,
                        label: 'Ajuda',
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              title: const Text(
                                'Como usar',
                                style: TextStyle(fontWeight: FontWeight.w700),
                              ),
                              content: const Text(
                                '1. Posicione a caixa ou receita dentro do quadro.\n\n'
                                '2. Certifique-se de ter boa iluminação.\n\n'
                                '3. Mantenha o celular firme e toque em Capturar.\n\n'
                                '4. Aguarde a análise automática.',
                                style: TextStyle(color: AppTheme.textGrey, height: 1.5),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: const Text('Entendi'),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  if (_capturedImage != null) ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isProcessing ? null : () {
                          // TODO: send to backend API
                        },
                        icon: const Icon(Icons.analytics_outlined, size: 18),
                        label: const Text('Analisar Documento'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScanFrame extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const color = Color(0xFF14B8A6);
    const size = 260.0;
    const cornerSize = 32.0;
    const strokeWidth = 4.0;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        children: [
          Center(
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                border: Border.all(color: color.withAlpha(76), width: 1),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const Positioned(
            top: 0,
            left: 0,
            child: _Corner(color: color, corner: _CornerPos.topLeft, size: cornerSize, width: strokeWidth),
          ),
          const Positioned(
            top: 0,
            right: 0,
            child: _Corner(color: color, corner: _CornerPos.topRight, size: cornerSize, width: strokeWidth),
          ),
          const Positioned(
            bottom: 0,
            left: 0,
            child: _Corner(color: color, corner: _CornerPos.bottomLeft, size: cornerSize, width: strokeWidth),
          ),
          const Positioned(
            bottom: 0,
            right: 0,
            child: _Corner(color: color, corner: _CornerPos.bottomRight, size: cornerSize, width: strokeWidth),
          ),
          const Positioned(
            bottom: 10,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'POSICIONE O DOCUMENTO',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

enum _CornerPos { topLeft, topRight, bottomLeft, bottomRight }

class _Corner extends StatelessWidget {
  final Color color;
  final _CornerPos corner;
  final double size;
  final double width;

  const _Corner({
    required this.color,
    required this.corner,
    required this.size,
    required this.width,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _CornerPainter(color: color, corner: corner, strokeWidth: width),
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final Color color;
  final _CornerPos corner;
  final double strokeWidth;

  _CornerPainter({required this.color, required this.corner, required this.strokeWidth});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    if (corner == _CornerPos.topLeft) {
      path.moveTo(0, size.height * 0.6);
      path.lineTo(0, 0);
      path.lineTo(size.width * 0.6, 0);
    } else if (corner == _CornerPos.topRight) {
      path.moveTo(size.width * 0.4, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, size.height * 0.6);
    } else if (corner == _CornerPos.bottomLeft) {
      path.moveTo(0, size.height * 0.4);
      path.lineTo(0, size.height);
      path.lineTo(size.width * 0.6, size.height);
    } else {
      path.moveTo(size.width * 0.4, size.height);
      path.lineTo(size.width, size.height);
      path.lineTo(size.width, size.height * 0.4);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ScanAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _ScanAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDisabled = onTap == null;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDisabled ? AppTheme.borderGrey : AppTheme.backgroundGrey,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.borderGrey),
            ),
            child: Icon(
              icon,
              color: isDisabled ? AppTheme.borderGrey : AppTheme.textGrey,
              size: 24,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDisabled ? AppTheme.borderGrey : AppTheme.textGrey,
            ),
          ),
        ],
      ),
    );
  }
}
