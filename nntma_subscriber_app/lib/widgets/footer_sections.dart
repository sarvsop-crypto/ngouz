import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../core/app_tokens.dart';
import 'content_container.dart';

class DarkCta extends StatelessWidget {
  const DarkCta({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTokens.navy,
      child: const ContentContainer(
        padding: EdgeInsets.fromLTRB(AppSpace.xl, AppSpace.xl, AppSpace.xl, AppSpace.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Get in touch with us for any support, or official requests.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 38, fontWeight: FontWeight.w700, height: 1.2),
            ),
            SizedBox(height: AppSpace.lg),
            _CtaButton(),
          ],
        ),
      ),
    );
  }
}

class _CtaButton extends StatelessWidget {
  const _CtaButton();

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      style: FilledButton.styleFrom(
        backgroundColor: AppTokens.primary,
        foregroundColor: Colors.white,
      ),
      onPressed: () {},
      child: const Text('Contact us'),
    );
  }
}

class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTokens.navy,
      child: ContentContainer(
        padding: EdgeInsets.fromLTRB(AppSpace.xl, 0, AppSpace.xl, AppSpace.xl),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Divider(color: AppTokens.primaryDark),
            SizedBox(height: AppSpace.lg),
            _FooterTop(),
            SizedBox(height: AppSpace.lg),
            Divider(color: AppTokens.primaryDark),
            SizedBox(height: AppSpace.md),
            _FooterBottom(),
          ],
        ),
      ),
    );
  }
}

class _FooterTop extends StatelessWidget {
  const _FooterTop();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final narrow = constraints.maxWidth < 860;
        if (narrow) {
          return const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _FooterInfo(),
              SizedBox(height: AppSpace.lg),
              _FooterMapCard(),
            ],
          );
        }
        return const Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(flex: 3, child: _FooterInfo()),
            SizedBox(width: AppSpace.lg),
            Expanded(flex: 2, child: _FooterMapCard()),
          ],
        );
      },
    );
  }
}

class _FooterInfo extends StatelessWidget {
  const _FooterInfo();

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tezkor havolalar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        SizedBox(height: 8),
        Text('Biz haqimizda', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text('Yangiliklar', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text('Tadbirlarimiz', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text("A'zo bo'lish", style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text('Grant va tanlovlar', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 16),
        Text("Bog'lanish", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        SizedBox(height: 8),
        Text('Tel: (+998 55) 503-05-12', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text('Email: info@ngo.uz', style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 6),
        Text("1A, Furqat ko'chasi, Shayxontohur t., Toshkent, 100170", style: TextStyle(color: AppTokens.textFooter)),
        SizedBox(height: 16),
        Text('Ijtimoiy tarmoqlar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        SizedBox(height: 8),
        _SocialRow(),
      ],
    );
  }
}

class _FooterMapCard extends StatelessWidget {
  const _FooterMapCard();

  static const _mapImage =
      'https://static-maps.yandex.ru/1.x/?lang=uz_UZ&ll=69.240568,41.312565&z=16&size=650,370&l=map&pt=69.240568,41.312565,pm2rdm';

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: AspectRatio(
        aspectRatio: 16 / 10,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              _mapImage,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(color: const Color(0xFF123E4A)),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                color: const Color(0xB3023347),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                child: const Text(
                  "1A, Furqat ko'chasi, Shayxontohur t., Toshkent, 100170",
                  style: TextStyle(color: Colors.white, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterBottom extends StatelessWidget {
  const _FooterBottom();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      alignment: WrapAlignment.spaceBetween,
      runSpacing: 8,
      spacing: 16,
      children: [
        Text(
          "© COPYRIGHT 2019-2026 O'zNNTMA",
          style: TextStyle(color: AppTokens.textFooter, fontSize: 12),
        ),
        Text(
          'info@ngo.uz',
          style: TextStyle(color: AppTokens.textFooter, fontSize: 12),
        ),
        Text(
          "Manzil: 1A, Furqat ko'chasi, Shayxontohur t., Toshkent, 100170",
          style: TextStyle(color: AppTokens.textFooter, fontSize: 12),
        ),
      ],
    );
  }
}

class _SocialRow extends StatelessWidget {
  const _SocialRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: const [
        _SocialIcon(PhosphorIconsRegular.xLogo),
        SizedBox(width: 8),
        _SocialIcon(PhosphorIconsRegular.instagramLogo),
        SizedBox(width: 8),
        _SocialIcon(PhosphorIconsRegular.linkedinLogo),
        SizedBox(width: 8),
        _SocialIcon(PhosphorIconsRegular.facebookLogo),
      ],
    );
  }
}

class _SocialIcon extends StatelessWidget {
  final IconData icon;

  const _SocialIcon(this.icon);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white54),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(icon, color: Colors.white, size: 14),
    );
  }
}
