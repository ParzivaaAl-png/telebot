import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TgAuthGuard } from './tg-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-cosmic-key-2026',
      signOptions: { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [JwtStrategy, TgAuthGuard],
  exports: [PassportModule, JwtModule, TgAuthGuard],
})
export class AuthModule {}
