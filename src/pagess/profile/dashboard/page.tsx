// app/profile/dashboard/page.tsx

import { TextChecker } from '@/components/TextChecker';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Mətn Yoxlayıcısı</span>
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Azərbaycan dilində mətninizi yoxlayın və düzəldin
          </CardDescription>
        </CardHeader>
      </Card>

      <TextChecker />
    </div>
  );
}
