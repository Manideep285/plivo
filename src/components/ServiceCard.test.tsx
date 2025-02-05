import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import { Service } from '@/types';

describe('ServiceCard', () => {
  const mockService: Service = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    status: "operational"
  };

  it('renders service name and status', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('operational')).toBeInTheDocument();
  });

  it('renders service description', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
