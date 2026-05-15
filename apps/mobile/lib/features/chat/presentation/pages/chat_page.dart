import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final String time;

  const ChatMessage(
      {required this.text, required this.isUser, required this.time});
}

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<ChatMessage> _messages = const [
    ChatMessage(
      text: 'Olá! Tenho tosse e febre há dois dias.',
      isUser: true,
      time: '14:32',
    ),
    ChatMessage(
      text:
          'Olá! Sinto muito por isso. Pode descrever sua tosse (seca/com catarro) e tem outros sintomas?',
      isUser: false,
      time: '14:32',
    ),
    ChatMessage(
      text: 'É uma tosse seca, e tenho dor de cabeça.',
      isUser: true,
      time: '14:33',
    ),
    ChatMessage(
      text:
          'Entendido. Você tomou algum medicamento e esteve em contato com alguém doente recentemente?',
      isUser: false,
      time: '14:33',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F8FF),
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _MessageBubble(message: msg);
              },
            ),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      shadowColor: Colors.black12,
      surfaceTintColor: Colors.transparent,
      leading: GestureDetector(
        onTap: () => context.go('/'),
        child: const Padding(
          padding: EdgeInsets.only(left: 8),
          child: Icon(Icons.arrow_back_ios_rounded, color: AppTheme.textDark),
        ),
      ),
      title: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF60A5FA), AppTheme.primaryBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryBlue.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(Icons.smart_toy_rounded,
                color: Colors.white, size: 22),
          ),
          const SizedBox(width: 10),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MediCare AI',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textDark,
                ),
              ),
              Row(
                children: [
                  CircleAvatar(radius: 4, backgroundColor: Color(0xFF22C55E)),
                  SizedBox(width: 5),
                  Text(
                    'Online',
                    style: TextStyle(fontSize: 12, color: AppTheme.textGrey),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.call_outlined, color: AppTheme.textGrey),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildInputBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 28),
      child: Column(
        children: [
          // Text input row
          Container(
            decoration: BoxDecoration(
              color: AppTheme.backgroundGrey,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppTheme.borderGrey),
            ),
            child: Row(
              children: [
                const SizedBox(width: 16),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(fontSize: 15),
                    decoration: const InputDecoration(
                      hintText: 'Descreva seus sintomas ou dúvida...',
                      hintStyle:
                          TextStyle(color: AppTheme.textGrey, fontSize: 14),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                Container(
                  margin: const EdgeInsets.all(6),
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF6C00),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded,
                      color: Colors.white, size: 18),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Bottom action row
          Row(
            children: [
              _buildIconBtn(Icons.mic_none_rounded),
              const SizedBox(width: 8),
              _buildIconBtn(Icons.attach_file_rounded),
              const Spacer(),
              const Text(
                'Enviar',
                style: TextStyle(
                  color: AppTheme.primaryBlue,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.arrow_forward_rounded,
                      color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIconBtn(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(
        color: AppTheme.backgroundGrey,
        shape: BoxShape.circle,
        border: Border.all(color: AppTheme.borderGrey),
      ),
      child: Icon(icon, size: 20, color: AppTheme.textGrey),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF60A5FA), AppTheme.primaryBlue],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.smart_toy_rounded,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
          ],
          Column(
            crossAxisAlignment:
                isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    isUser ? 'Você' : 'MediCare AI',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textDark,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    message.time,
                    style:
                        const TextStyle(fontSize: 11, color: AppTheme.textGrey),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.65,
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isUser ? const Color(0xFFDEEBFF) : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isUser ? 18 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 18),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  message.text,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppTheme.textDark,
                    height: 1.45,
                  ),
                ),
              ),
            ],
          ),
          if (isUser) ...[
            const SizedBox(width: 10),
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person,
                  color: AppTheme.primaryBlue, size: 20),
            ),
          ],
        ],
      ),
    );
  }
}
