import { Incident, Service, Maintenance } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Mock SendGrid implementation since we're not installing dependencies
const sgMail = {
  setApiKey: (key: string) => {},
  send: async (data: any) => Promise.resolve(),
};

interface NotificationRecipient {
  email: string;
  name?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private subscribers: Map<string, NotificationRecipient[]> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async subscribeToService(serviceId: string, recipient: NotificationRecipient) {
    const subscribers = this.subscribers.get(serviceId) || [];
    if (!subscribers.some(sub => sub.email === recipient.email)) {
      subscribers.push(recipient);
      this.subscribers.set(serviceId, subscribers);
    }
  }

  async unsubscribeFromService(serviceId: string, email: string) {
    const subscribers = this.subscribers.get(serviceId) || [];
    this.subscribers.set(
      serviceId,
      subscribers.filter(sub => sub.email !== email)
    );
  }

  async notifyIncident(incident: Incident, service: Service) {
    const subscribers = this.subscribers.get(service.id) || [];
    const subject = `[${service.name}] Incident: ${incident.title}`;
    const html = `
      <h2>Incident Report</h2>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Status:</strong> ${incident.status}</p>
      <p><strong>Description:</strong> ${incident.description}</p>
      <p><strong>Started:</strong> ${new Date(incident.createdAt).toLocaleString()}</p>
      <hr/>
      <p>View more details on your status page dashboard.</p>
    `;

    await this.sendEmails(subscribers, subject, html);
    toast({
      title: 'New Incident',
      description: `${incident.title} - ${incident.description}`,
      variant: incident.severity === 'critical' ? 'destructive' : 'default',
    });
  }

  async notifyMaintenance(maintenance: Maintenance, service: Service) {
    const subscribers = this.subscribers.get(service.id) || [];
    const subject = `[${service.name}] Scheduled Maintenance`;
    const html = `
      <h2>Scheduled Maintenance</h2>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Description:</strong> ${maintenance.description}</p>
      <p><strong>Start Time:</strong> ${new Date(maintenance.startDateTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${new Date(maintenance.endDateTime).toLocaleString()}</p>
      <p><strong>Impact:</strong> ${maintenance.impact}</p>
      <hr/>
      <p>View more details on your status page dashboard.</p>
    `;

    await this.sendEmails(subscribers, subject, html);
    toast({
      title: 'Maintenance Update',
      description: `${maintenance.title} - ${maintenance.description}\nScheduled: ${new Date(maintenance.startTime).toLocaleString()} - ${new Date(maintenance.endTime).toLocaleString()}`,
    });
  }

  async notifyStatusChange(service: Service, oldStatus: string, newStatus: string) {
    const subscribers = this.subscribers.get(service.id) || [];
    const subject = `[${service.name}] Status Change`;
    const html = `
      <h2>Service Status Update</h2>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Status Change:</strong> ${oldStatus} → ${newStatus}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr/>
      <p>View more details on your status page dashboard.</p>
    `;

    await this.sendEmails(subscribers, subject, html);
    toast({
      title: 'Status Change',
      description: `${service.name} is now ${newStatus}`,
      variant: newStatus === 'operational' ? 'default' : 'destructive',
    });
  }

  private async sendEmails(recipients: NotificationRecipient[], subject: string, html: string) {
    const emails = recipients.map(recipient => ({
      to: recipient.email,
      from: 'notifications@your-status-page.com',
      subject,
      html,
    }));

    try {
      await Promise.all(emails.map(email => sgMail.send(email)));
    } catch (error) {
      console.error('Error sending notification emails:', error);
      throw new Error('Failed to send notification emails');
    }
  }
}
