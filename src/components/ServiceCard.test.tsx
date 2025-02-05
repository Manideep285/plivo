import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import { Service, ServiceStatus } from '@/types';

describe('ServiceCard', () => {
  const mockService: Service = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    status: ServiceStatus.Operational,
    monitoredUrl: 'https://test.com'
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
