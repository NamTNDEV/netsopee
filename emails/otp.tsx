import { Body, Button, Container, Head, Heading, Html, Img, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

interface OTPEmailProps {
    otpCode: string;
    title: string;
}

const logoUrl = 'https://www.creativefabrica.com/wp-content/uploads/2019/02/Online-shop-shopping-shop-logo-by-DEEMKA-STUDIO-3-580x406.jpg';

export const OTPEmail = ({ otpCode, title }: OTPEmailProps) => (
    <Html>
        <Head>
            <title>{title}</title>
        </Head>
        <Body style={main}>
            <Container style={container}>
                <Img src={logoUrl} width="80" height="80" alt="Netsopee Logo" style={logo} />
                <Text style={tertiary}>🔐 MÃ XÁC THỰC OTP</Text>
                <Heading style={secondary}>Nhập mã OTP bên dưới để tiếp tục</Heading>

                {/* Hộp OTP */}
                <Section style={codeContainer}>
                    <Text style={code}>{otpCode}</Text>
                </Section>

                {/* Nút CTA */}
                <Button style={button} href="https://netsopee.com/verify-otp">
                    Nhập mã ngay
                </Button>

                {/* Lưu ý */}
                <Text style={paragraph}>
                    Nếu bạn không yêu cầu mã này, xin hãy bỏ qua email. Đừng chia sẻ OTP với bất kỳ ai để bảo mật tài khoản.
                </Text>
            </Container>

            <Text style={footer}>© 2025 Netsopee. Tất cả các quyền được bảo lưu.</Text>
        </Body>
    </Html>
);

OTPEmail.PreviewProps = {
    otpCode: '144833',
    title: 'Mã OTP',
} as OTPEmailProps;

export default OTPEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica, Arial, sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    marginTop: '20px',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
    borderRadius: '50%',
    objectFit: 'cover',
};

const tertiary = {
    color: '#e63946',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
};

const secondary = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '20px',
};

const codeContainer = {
    background: '#f8f9fa', // Nền sáng hơn để dễ nhìn
    borderRadius: '10px', // Bo tròn mềm mại hơn
    padding: '16px 0',
    display: 'block',
    width: '75%',
    margin: '16px auto 14px',
    marginBottom: '16px', // Tạo khoảng cách với nút CTA
};

const code = {
    color: '#222',
    fontSize: '32px', // Tăng kích thước OTP cho dễ nhìn
    fontWeight: 'bold',
    letterSpacing: '12px',
    width: 'full',
    minWidth: '270px',
    margin: '0 auto',
    display: 'inline-block',
};

const button = {
    backgroundColor: '#e63946',
    color: '#fff',
    fontSize: '16px',
    padding: '12px 24px',
    borderRadius: '6px', // Làm tròn hơn
    display: 'inline-block',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '10px', // Tạo khoảng cách giữa OTP và nút CTA
};

const paragraph = {
    color: '#666',
    fontSize: '14px',
    marginTop: '15px',
    padding: '0 20px',
};

const footer = {
    color: '#999',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '30px',
};