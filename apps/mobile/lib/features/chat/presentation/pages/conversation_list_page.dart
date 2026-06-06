import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/chat_notifier.dart';
import '../../domain/chat_models.dart';

class ConversationListPage extends ConsumerStatefulWidget {
  const ConversationListPage({super.key});

  @override
  ConsumerState<ConversationListPage> createState() => _ConversationListPageState();
}

class _ConversationListPageState extends ConsumerState<ConversationListPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(conversationsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F8FF),
      appBar: AppBar(
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
        title: const Text(
          'Minhas Conversas',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppTheme.textDark,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryBlue,
          unselectedLabelColor: AppTheme.textGrey,
          indicatorColor: AppTheme.primaryBlue,
          tabs: const [
            Tab(text: 'Ativas'),
            Tab(text: 'Arquivadas'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textGrey),
            onPressed: () => ref.read(conversationsProvider.notifier).load(),
            tooltip: 'Atualizar',
          ),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded, color: AppTheme.primaryBlue),
            onPressed: () => context.go('/profile'),
            tooltip: 'Perfil',
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildList(context, ref, state, state.conversations, false),
          _buildList(context, ref, state, state.archivedConversations, true),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createNewConversation(context, ref),
        backgroundColor: AppTheme.primaryBlue,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Nova Conversa',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildList(BuildContext context, WidgetRef ref, ConversationsState state, List<Conversation> items, bool isArchivedTab) {
    if (state.isLoading && items.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryBlue),
      );
    }

    if (state.error != null && items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.cloud_off_rounded, size: 64, color: AppTheme.textGrey),
              const SizedBox(height: 16),
              Text(
                state.error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.textGrey, fontSize: 15),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => ref.read(conversationsProvider.notifier).load(),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Tentar novamente'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 96,
                height: 96,
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
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              Text(
                isArchivedTab ? 'Nenhuma conversa arquivada' : 'Nenhuma conversa ainda',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textDark,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(conversationsProvider.notifier).load(),
      color: AppTheme.primaryBlue,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final conv = items[index];
          return _ConversationCard(
            conversation: conv,
            onTap: () => context.go('/chat/${conv.id}'),
            onRename: (newTitle) => ref.read(conversationsProvider.notifier).updateConversation(conv.id, title: newTitle),
            onToggleArchive: () => ref.read(conversationsProvider.notifier).updateConversation(conv.id, isArchived: !conv.isArchived),
          );
        },
      ),
    );
  }

  Future<void> _createNewConversation(BuildContext context, WidgetRef ref) async {
    final conv = await ref.read(conversationsProvider.notifier).create();
    if (conv != null && context.mounted) {
      context.go('/chat/${conv.id}');
    }
  }
}

class _ConversationCard extends StatelessWidget {
  final Conversation conversation;
  final VoidCallback onTap;
  final Function(String) onRename;
  final VoidCallback onToggleArchive;

  const _ConversationCard({
    required this.conversation,
    required this.onTap,
    required this.onRename,
    required this.onToggleArchive,
  });

  Future<void> _showRenameDialog(BuildContext context) async {
    final controller = TextEditingController(text: conversation.title);
    final result = await showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Renomear Conversa'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(hintText: 'Novo título'),
            autofocus: true,
            textCapitalization: TextCapitalization.sentences,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, null),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Salvar'),
            ),
          ],
        );
      },
    );

    if (result != null && result.trim().isNotEmpty && result.trim() != conversation.title) {
      onRename(result.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('dd/MM HH:mm');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF60A5FA), AppTheme.primaryBlue],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      conversation.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (conversation.summary != null && conversation.summary!.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        conversation.summary!,
                        style: const TextStyle(fontSize: 12, color: AppTheme.textGrey),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      dateFormatter.format(conversation.updatedAt.toLocal()),
                      style: const TextStyle(fontSize: 11, color: AppTheme.textGrey),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: AppTheme.textGrey),
                onSelected: (value) {
                  if (value == 'rename') {
                    _showRenameDialog(context);
                  } else if (value == 'archive_toggle') {
                    onToggleArchive();
                  }
                },
                itemBuilder: (context) => [
                  if (!conversation.isArchived)
                    const PopupMenuItem(
                      value: 'rename',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 20, color: AppTheme.textDark),
                          SizedBox(width: 8),
                          Text('Renomear'),
                        ],
                      ),
                    ),
                  PopupMenuItem(
                    value: 'archive_toggle',
                    child: Row(
                      children: [
                        Icon(conversation.isArchived ? Icons.unarchive : Icons.archive, size: 20, color: AppTheme.textDark),
                        const SizedBox(width: 8),
                        Text(conversation.isArchived ? 'Desarquivar' : 'Arquivar'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
