import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, Shield, QrCode, ExternalLink } from "lucide-react";

interface BlockchainVerificationProps {
  verificationId?: string;
  blockchainHash?: string;
  status?: "pending" | "verified" | "failed" | "revoked";
  verifiedAt?: Date;
  onVerify?: () => Promise<void>;
  showQRCode?: boolean;
}

/**
 * BlockchainVerification Component
 * Displays blockchain verification status and provides verification actions
 */
export default function BlockchainVerification({
  verificationId,
  blockchainHash,
  status,
  verifiedAt,
  onVerify,
  showQRCode = true,
}: BlockchainVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!onVerify) return;
    
    setIsVerifying(true);
    try {
      await onVerify();
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
      case "revoked":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified on Blockchain</Badge>;
      case "failed":
        return <Badge variant="destructive">Verification Failed</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Verification</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  const getPublicVerificationUrl = () => {
    if (!verificationId) return "";
    // This URL should match your TrusTell configuration
    return `https://verify.trustell.ae/${verificationId}`;
  };

  const getQRCodeUrl = () => {
    if (!verificationId) return "";
    return `https://api.trustell.ae/v1/qr/${verificationId}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle>Blockchain Verification</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Secure verification powered by TrusTell blockchain technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationId && !blockchainHash && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This document has not been registered on the blockchain yet.
              {onVerify && (
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="mt-2 w-full"
                >
                  {isVerifying ? "Registering..." : "Register on Blockchain"}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {verificationId && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Verification ID
              </label>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                {verificationId}
              </p>
            </div>

            {blockchainHash && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blockchain Hash
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                  {blockchainHash}
                </p>
              </div>
            )}

            {verifiedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Verified At
                </label>
                <p className="text-sm mt-1">
                  {new Date(verifiedAt).toLocaleString()}
                </p>
              </div>
            )}

            {status === "verified" && (
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getPublicVerificationUrl(), "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Verification
                </Button>

                {showQRCode && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Scan QR code to verify
                    </p>
                    <img
                      src={getQRCodeUrl()}
                      alt="Verification QR Code"
                      className="w-32 h-32 border-2 border-border rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This verification is secured by blockchain technology and cannot be tampered with.
            The verification record is permanently stored on a distributed ledger.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
