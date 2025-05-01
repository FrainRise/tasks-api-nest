import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();

  beforeEach(() => {
    dto = new CreateUserDto();

    // default values
    dto.email = 'test@gmail.com';
    dto.name = 'Test';
    dto.password = 'Qwerty1#';
  });

  const testPassword = async (password: string, message: string) => {
    dto.password = password;

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    const messages = Object.values(passwordError?.constraints ?? {});

    expect(passwordError).not.toBeUndefined();
    expect(messages).toContain(message);
  };

  it('should validate complete valid data', async () => {
    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail on invalid email value', async () => {
    // Arrange
    dto.email = '123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail without at least  1 uppercase letter', async () => {
    const errorMessage = 'Password must contain at least 1 uppercase letter';
    await testPassword('adadada', errorMessage);
  });

  it('should fail without at least  1 number', async () => {
    const errorMessage = 'Password must contain at least 1 number';
    await testPassword('adadadA', errorMessage);
  });

  it('should fail without at least 1 special character', async () => {
    const errorMessage = 'Password must contain at least 1 special character';
    await testPassword('adadadA2', errorMessage);
  });
});
