import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFDEEFFD), Color(0xFFF0F8FF), Color(0xFFFFFFFF)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                // Header row
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => context.go('/profile'),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.person, color: AppTheme.primaryBlue, size: 26),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Greeting
                const Text(
                  'Olá! 👋',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.textGrey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Como posso ajudar\ncom seus medicamentos?',
                  style: TextStyle(
                    fontSize: 26,
                    color: AppTheme.darkBlue,
                    fontWeight: FontWeight.w800,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 32),
                // Chat with AI Card (highlighted)
                _ActionCard(
                  highlighted: true,
                  icon: '🤖',
                  title: 'Falar com IA',
                  subtitle: 'Tire dúvidas sobre medicamentos',
                  onTap: () => context.go('/conversations'),
                ),
                const SizedBox(height: 14),
                // Scan Card
                _ActionCard(
                  highlighted: false,
                  icon: '📷',
                  title: 'Escanear Caixa',
                  subtitle: 'Analise detalhes e instruções',
                  onTap: () => context.go('/scan'),
                ),
                const SizedBox(height: 14),
                // Upload Card
                _ActionCard(
                  highlighted: false,
                  icon: '📋',
                  title: 'Enviar Receita',
                  subtitle: 'Digitalize e armazene com segurança',
                  onTap: () => context.go('/scan'),
                ),
                const Spacer(),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const _HomeBottomNav(currentIndex: 0),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final bool highlighted;
  final String icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.highlighted,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: BoxDecoration(
          gradient: highlighted
              ? const LinearGradient(
                  colors: [Color(0xFF6BAED6), Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: highlighted ? null : AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: highlighted
                  ? AppTheme.primaryBlue.withValues(alpha: 0.3)
                  : Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 36)),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: highlighted ? Colors.white : AppTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: highlighted
                          ? Colors.white.withValues(alpha: 0.85)
                          : AppTheme.textGrey,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: highlighted ? Colors.white : AppTheme.textGrey,
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeBottomNav extends StatelessWidget {
  final int currentIndex;

  const _HomeBottomNav({required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(
            icon: Icons.home_rounded,
            isActive: currentIndex == 0,
            onTap: () => context.go('/'),
          ),
          _NavItem(
            icon: Icons.calendar_month_outlined,
            isActive: currentIndex == 1,
            onTap: () {},
          ),
          _NavItem(
            icon: Icons.assignment_outlined,
            isActive: currentIndex == 2,
            onTap: () {},
          ),
          _NavItem(
            icon: Icons.person_outline_rounded,
            isActive: currentIndex == 3,
            onTap: () => context.go('/profile'),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({required this.icon, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primaryBlue.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(
          icon,
          color: isActive ? AppTheme.primaryBlue : AppTheme.textGrey,
          size: 26,
        ),
      ),
    );
  }
}
